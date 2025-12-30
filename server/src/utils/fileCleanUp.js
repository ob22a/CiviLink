import fs from "fs/promises";

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    // Silent fail — file may already be gone
  }
}
