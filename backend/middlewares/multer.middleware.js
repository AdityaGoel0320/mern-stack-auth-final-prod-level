import multer from "multer";
import fs from "fs";
const dir = "./public/temp";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // folder must exist, otherwise multer will throw error
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // right now it saves files with original name (can cause overwriting if names repeat)
    cb(null, file.originalname);
  }
});

// Export upload middleware
export const multerImageUploadMiddleware = multer({ storage  ,limits: { fileSize: 10 * 1024 * 1024 }});
