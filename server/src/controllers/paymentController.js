import Payment from "../models/Payment.js";
import PDFDocument from "pdfkit";
import axios from "axios";
import { v4 as uuid } from "uuid";

// Initialize payment (pending + Chapa checkout)
const processPayment = async (req, res, next) => {
  try {
    const { applicationId, serviceType, phoneNumber, amount } = req.body;
    const userId = req.user.id;

    // basic validation
    if (!applicationId || !serviceType || !phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: "applicationId, serviceType, phoneNumber and amount are required" });
    }

    const txRef = `pay_${uuid()}`;

    const payment = await Payment.create({
      userId,
      applicationId,
      serviceType,
      phoneNumber,
      amount,
      txRef,
      status: "pending",
    });

    const callbackUrl = process.env.PAYMENT_CALLBACK_URL || `http://localhost:${process.env.PORT || 3000}/api/v1/payments/webhook`;
    const returnUrl = process.env.PAYMENT_RETURN_URL || "https://example.com/payment-return";

    let response;
    try {
      response = await axios.post(
        `${process.env.CHAPA_BASE_URL}/v1/transaction/initialize`,
        {
          amount,
          currency: "ETB",
          phone_number: phoneNumber,
          tx_ref: txRef,
          return_url: returnUrl,
          callback_url: callbackUrl,
          customization: {
            title: "Service Payment",
            description: serviceType,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        }
      );
    } catch (err) {
      // external init failed — mark payment failed and return error
      payment.status = "failed";
      await payment.save();
      return res.status(502).json({ success: false, message: "Payment gateway initialization failed" });
    }

    const checkoutUrl = response?.data?.data?.checkout_url;

    return res.status(201).json({
      success: true,
      data: {
        paymentId: payment._id,
        checkoutUrl,
        txRef,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment status with Chapa (sets success/failed)
const verifyPayment = async (req, res, next) => {
  try {
    const { txRef } = req.params;

    const response = await axios.get(
      `${process.env.CHAPA_BASE_URL}/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const chapaStatus = response?.data?.data?.status; // success | failed | pending

    const payment = await Payment.findOne({ txRef });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Update only if final status
    if (["success", "failed"].includes(chapaStatus)) {
      payment.status = chapaStatus;
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        status: payment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get payment status (citizen/officer/admin)
const getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    // Citizens can only access their payments
    if (user.role === "citizen" && payment.userId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Officers see boolean only
    if (user.role === "officer") {
      return res.status(200).json({ success: true, data: { paymentComplete: payment.status === "success" } });
    }

    // Admin/owner sees full details
    return res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        serviceType: payment.serviceType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get payment history (citizen)
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v"); // keep txRef if needed by verify

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// Download PDF receipt (success payments only)
const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (payment.status !== "success") {
      return res.status(400).json({ success: false, message: "Receipt not available" });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${payment._id}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text("Payment Receipt", { align: "center" }).moveDown();
    doc.fontSize(14).text(`Receipt ID: ${payment._id}`);
    doc.text(`Service: ${payment.serviceType}`);
    const amt = typeof payment.amount === "number" ? payment.amount.toFixed(2) : payment.amount;
    doc.text(`Amount Paid: ${amt} ETB`);
    doc.text(`Phone: ${payment.phoneNumber}`);
    doc.text(`Payment Status: ${payment.status}`);
    doc.text(`Date: ${payment.createdAt.toDateString()}`);
    doc.end();
  } catch (error) {
    next(error);
  }
};

export {
  processPayment,
  verifyPayment,
  getPaymentStatus,
  getPaymentHistory,
  downloadReceipt,
};
