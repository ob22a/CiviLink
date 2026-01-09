import Application from "../models/Application.js";

export async function generateTIN() {
  for(let i = 0; i < 10 ; i++) {

    // 10-digit numeric TIN
    const tin = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const exists = await Application.exists({
      category: "TIN",
      status: "approved",
      "formData.tin": tin
    });

    if (!exists) {
      return tin;
    }
  }

  throw new Error("Failed to generate unique TIN after 10 attempts. Try again.");
}