import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// assuming file has come in server and will be uploaded to cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("Cloudinary upload failed: No local file path provided.");
            return null;
        }

        // Upload the file to Cloudinary
        // The resource_type: "auto" tells Cloudinary to determine the file type
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        console.log("\nFile uploaded to Cloudinary successfully!", response);
        
        // After successful upload, remove the locally saved temporary file
        console.log("\nafter uploading the file deleted from the public folder on local")
        fs.unlinkSync(localFilePath);
        
        return response;

    } catch (error) {
        // Log the actual error from Cloudinary for better debugging
        console.error("Error during Cloudinary upload:", error);

        // An error occurred, so remove the locally saved temporary file
        // This prevents orphaned files on your server if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return null;
    }
}

export { uploadOnCloudinary };
