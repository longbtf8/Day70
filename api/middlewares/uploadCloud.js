const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "files",
    allowed_formats: ["jpg", "png", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
