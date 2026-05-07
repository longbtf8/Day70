const multer = require("multer");
const uploadCloud = require("./uploadCloud");
const uploadGalleryMiddleware = (req, res, next) => {
  const upload = uploadCloud.array("products", 5);
  upload(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: "File không được quá 5MB và không được quá 5 tệp",
      });
    }
    next();
  });
};
module.exports = uploadGalleryMiddleware;
