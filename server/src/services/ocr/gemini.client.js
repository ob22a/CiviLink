import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KEBELE_SYSTEM_PROMPT, FAYDA_SYSTEM_PROMPT } from "./prompt.js";
import { FAYDA_RESPONSE_SCHEMA, KEBELE_RESPONSE_SCHEMA } from "./schema.js";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  if (process.env.NODE_ENV !== "test") {
    console.log("GEMINI_API_KEY not set");
    process.exit(1);
  } else {
    console.log(
      "GEMINI_API_KEY not set, but skipping exit in test environment"
    );
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let model = "";

export async function runGeminiOCR(imagePath, idType) {
  if (idType == "kebele") {
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: KEBELE_RESPONSE_SCHEMA,
      },
      systemInstruction: KEBELE_SYSTEM_PROMPT,
    });
  } else if (idType == "fayda") {
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: FAYDA_RESPONSE_SCHEMA,
      },
      systemInstruction: FAYDA_SYSTEM_PROMPT,
    });
  }

  const imageBytes = fs.readFileSync(imagePath);

  const imagePart = {
    inlineData: {
      data: imageBytes.toString("base64"),
      mimeType: "image/jpeg",
    },
  };

  const result = await model.generateContent([
    "Extract all requested fields from this ID card image.",
    imagePart,
  ]);

  const text = result?.response?.text();

  if (!text) {
    throw new Error("EMPTY_GEMINI_RESPONSE");
  }

  const parsedText = JSON.parse(text);

  try {
    return parsedText;
  } catch {
    throw new Error("INVALID_GEMINI_JSON");
  }
}
