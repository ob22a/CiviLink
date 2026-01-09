import { extractIdData } from "../services/ocr/ocr.service.js";
import { deleteFile } from "../utils/fileCleanUp.js"; // corrected import path from fileCleanup to fileCleanUp
import FaydaId from "../models/faydaIdSchema.js"
import KebeleId from "../models/kebeleIdSchema.js"

const faydaOCR = async (req, res) => {

    // Check if fayda ID has been uploaded
    const existingFaydaId = await FaydaId.findOne({ userId: req.user.id });
    if (existingFaydaId) {
        return res.status(409).json({
            success: false,
            message: "Fayda ID already uploaded.",
        });
    }

    const idType = "fayda";
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "NO FILE UPLOADED"
        });
    }

    try {
        const data = await extractIdData(req.file.path, idType);

        let dob = new Date(data.dob);
        let doe = new Date(data.expiry_date)

        let faydaId = new FaydaId(
            {
                userId: req.user.id,
                fullName: data.full_name,
                dateOfBirth: dob,
                sex: data.sex,
                expiryDate: doe,
                fan: data.fan
            }
        );

        await faydaId.save();

        return res.status(201).json({
            success: true,
            data: {
                message: "Fayda ID uploaded successfully and OCR processing finished."
            }
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            message: "OCR FAILED"
        });
    } finally {
        await deleteFile(req.file.path);
    }
};

const kebeleOCR = async (req, res) => {

    // Check if kebele ID has been uploaded
    const existingKebeleId = await KebeleId.findOne({ userId: req.user.id });
    if (existingKebeleId) {
        return res.status(409).json({
            success: false,
            message: "Kebele ID already uploaded.",
        });
    }

    const idType = "kebele";
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "NO FILE UPLOADED"
        });
    }

    try {
        const data = await extractIdData(req.file.path, idType);

        let dob = new Date(data.dob);
        let doe = new Date(data.expiry_date)

        let kebeleId = new KebeleId(
            {
                userId: req.user.id,
                fullName: data.full_name,
                dateOfBirth: dob,
                sex: data.sex,
                expiryDate: doe,
                idNumber: data.id_no
            }
        );

        await kebeleId.save();

        return res.status(201).json({
            success: true,
            data: {
                message: "Kebele ID uploaded successfully and OCR processing finished."
            }
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            message: "OCR FAILED"
        });
    } finally {
        await deleteFile(req.file.path);
    }
};

const getIDData = async (req, res) => {
    try {
        const faydaId = await FaydaId.findOne({ userId: req.user.id });
        const kebeleId = await KebeleId.findOne({ userId: req.user.id });

        return res.status(200).json({
            success: true,
            data: {
                fayda: faydaId,
                kebele: kebeleId
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch ID data.",
        });
    }
}

export { faydaOCR, kebeleOCR, getIDData };
