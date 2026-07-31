import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Helper to verify if valid, non-placeholder Cloudinary credentials exist in environment variables
const isCloudinaryConfigured = (): boolean => {
  if (!cloudName || !apiKey || !apiSecret) return false;
  // Detect placeholder/dummy API keys
  if (
    apiKey.includes("GkyKKPhQyoE") ||
    apiKey === "your_api_key" ||
    apiSecret.includes("GkyKKPhQyoE") ||
    apiSecret === "your_api_secret"
  ) {
    return false;
  }
  return true;
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Uploads a base64 image string or file URL to Cloudinary if configured with valid keys.
 * Otherwise, cleanly returns fileStr so it is stored directly in the database without 401 errors.
 */
export const uploadToCloudinary = async (
  fileStr?: string | null,
  folder: string = "fixitnow/avatars"
): Promise<string | null> => {
  if (!fileStr || typeof fileStr !== "string" || !fileStr.trim()) {
    return null;
  }

  // If it's already a hosted URL (http:// or https://), return as-is
  if (fileStr.startsWith("http://") || fileStr.startsWith("https://")) {
    return fileStr;
  }

  // If Cloudinary is not properly configured with real credentials, save image string directly to DB
  if (!isCloudinaryConfigured()) {
    return fileStr;
  }

  try {
    const result = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: "image",
    });
    return result.secure_url || fileStr;
  } catch (error) {
    console.warn("Cloudinary upload failed, falling back to database storage:", error);
    return fileStr;
  }
};
