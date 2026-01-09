import { runGeminiOCR } from "./gemini.client.js"

function kebeleNormalize(data) {
  return {
    full_name: data.full_name || "NOT_FOUND",
    dob: data.dob || "NOT_FOUND",
    sex:
      data.sex?.toUpperCase().startsWith("M") ? "M" :
      data.sex?.toUpperCase().startsWith("F") ? "F" :
      "NOT_FOUND",
    expiry_date: data.expiry_date || "NOT_FOUND",
    id_no: data.id_no || "NOT_FOUND"
  };
}

function faydaNormalize(data) {

  return {
    full_name: data.full_name || "NOT_FOUND",
    dob: data.dob || "NOT_FOUND",
    sex:
      data.sex?.toUpperCase().startsWith("M") ? "M" :
      data.sex?.toUpperCase().startsWith("F") ? "F" :
      "NOT_FOUND",
    expiry_date: data.expiry_date || "NOT_FOUND",
    fan: data.fan ? data.fan.replace(/\s+/g, "") : "NOT_FOUND"
  };
}

export async function extractIdData(imagePath, idType) {

  try {
    const rawData = await runGeminiOCR(imagePath, idType);

    let normalized = {};

    if (idType == "kebele") {
      normalized = kebeleNormalize(rawData, idType);
    } else {
      normalized = faydaNormalize(rawData, idType);
    }
    

    // Basic completeness check
    const missing = Object.values(normalized).includes("NOT_FOUND");
    if (missing) {
      throw new Error("EXTRACTION_INCOMPLETE");
    }

    return normalized;
  } catch (err) {
    // Bubble up meaningful OCR errors
    throw err;
  }
}