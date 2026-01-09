import User from "../models/User.js";
import Payment from "../models/Payment.js";
import PDFDocument from "pdfkit";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { makeNotification } from "../utils/makeNotification.js";

// Initialize payment (pending + Chapa checkout)
const processPayment = async (req, res, next) => {
  try {
    const { applicationId, serviceType, phoneNumber, amount } = req.body;
    const userId = req.user.id;

    // basic validation
    if (!serviceType || !phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: "serviceType, phoneNumber and amount are required" });
    }

    const txRef = `pay_${uuid()}`;

    // Fetch user details for Chapa
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [firstName, ...lastNameParts] = user.fullName ? user.fullName.split(" ") : ["Unknown", "User"];
    const lastName = lastNameParts.join(" ") || "User";

    const payment = await Payment.create({
      userId,
      applicationId,
      serviceType,
      phoneNumber,
      amount,
      txRef,
      status: "pending",
    });

    const callbackUrl = process.env.PAYMENT_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/v1/payments/webhook`;
    const frontendUrl = process.env.FRONT_END_URL || "http://localhost:5173";
    const returnUrl = req.body.returnUrl || process.env.PAYMENT_RETURN_URL || `${frontendUrl}/user/payment/callback`;
    const chapaBaseUrl = process.env.CHAPA_BASE_URL || process.env.CHAPA_BASE || "https://api.chapa.co";

    // Debug logging
    console.log("CHAPA Configuration:", {
      baseUrl: chapaBaseUrl,
      hasSecretKey: !!process.env.CHAPA_SECRET_KEY,
      callbackUrl,
      returnUrl
    });

    if (!process.env.CHAPA_SECRET_KEY) {
      throw new Error("CHAPA_SECRET_KEY is missing in environment variables");
    }

    const payload = {
      amount: amount.toString(), // Chapa expects string
      currency: "ETB",
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      tx_ref: txRef,
      return_url: returnUrl,
      callback_url: callbackUrl,
      customization: {
        title: "Service Payment",
        description: serviceType,
      },
    };

    console.log("Chapa Payload:", JSON.stringify(payload, null, 2));

    let response;
    let retries = 3;
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Chapa API attempt ${attempt}/${retries}...`);
        response = await axios.post(
          `${chapaBaseUrl}/v1/transaction/initialize`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
              "Content-Type": "application/json"
            },
            timeout: 10000 // 10 second timeout
          }
        );
        console.log("Chapa Response:", response.data);

        const checkoutUrl = response?.data?.data?.checkout_url;

        makeNotification(userId, "Payment Status", `Payment for ${serviceType} has been initiated`);

        return res.status(201).json({
          success: true,
          data: {
            paymentId: payment._id,
            checkoutUrl,
            txRef,
          },
        });
      } catch (err) {
        lastError = err;

        // Check if it's a network/DNS error
        if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
          console.error(`Chapa Network Error (Attempt ${attempt}/${retries}):`, {
            code: err.code,
            message: err.message,
            hostname: err.hostname
          });

          // Wait before retry (exponential backoff)
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        } else {
          // Non-network error, don't retry
          console.error("Chapa API Error:", err.response ? {
            status: err.response.status,
            data: err.response.data
          } : err.message);
          break;
        }
      }
    }

    // All retries failed
    payment.status = "failed";
    await payment.save();

    const isDnsError = lastError.code === 'ENOTFOUND';
    return res.status(502).json({
      success: false,
      message: isDnsError
        ? "Cannot reach payment gateway. Please check your internet connection and try again."
        : "Payment gateway initialization failed",
      error: lastError.response?.data?.message || lastError.message,
      details: isDnsError ? {
        suggestion: "This is a network connectivity issue. Please ensure you have internet access and try again."
      } : lastError.response?.data
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment status with Chapa (sets success/failed)
const verifyPayment = async (req, res, next) => {
  try {
    const { txRef } = req.params;

    const chapaBaseUrl = process.env.CHAPA_BASE_URL || process.env.CHAPA_BASE || "https://api.chapa.co";

    const response = await axios.get(
      `${chapaBaseUrl}/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    console.log("CHAPA Verification Response:", JSON.stringify(response.data, null, 2));

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

    const msg = chapaStatus === "success" ? "Payment successful" : "Payment failed";
    makeNotification(payment.userId, "Payment Status", msg);

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

// Get payment by application ID
const getPaymentByApplicationId = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ applicationId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Verify ownership
    if (payment.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        serviceType: payment.serviceType,
        txRef: payment.txRef
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get payment history (citizen)
const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Payment.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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
  getPaymentByApplicationId,
  getPaymentHistory,
  downloadReceipt,
};

