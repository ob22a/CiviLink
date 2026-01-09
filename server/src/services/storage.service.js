import { supabase } from "../../config/supabase.js";

// src/services/storageService.js
export const getSignedUploadUrl = async (fileName) => {
  // Use a simple name - no folders, no spaces
  const filePath = `test_${Date.now()}.png`; 

  console.log("--- DEBUG START ---");
  console.log("Using Bucket: 'News'");
  console.log("File Path target:", filePath);

  // DEBUG: Let's see if the bucket is even visible to the client
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  console.log("Available buckets:", buckets?.map(b => b.name));

  const { data, error } = await supabase
    .storage
    .from('News') 
    .createSignedUploadUrl(filePath, 3600);

  if (error) {
    console.error("❌ ERROR DURING URL GENERATION:", error);
    throw error;
  }

  console.log("✅ GENERATED URL:", data.signedUrl);
  console.log("--- DEBUG END ---");

  return {
    uploadUrl: data.signedUrl,
    publicStoragePath: filePath 
  };
};