const express = require("express");
const validate = require("../middlewares/validate");
const {
  createProductSchema,
  updateProductSchema,
  deleteImageSchema,
} = require("../validations/product.schema");
const router = express.Router();
const uploadCloud = require("../middlewares/uploadCloud");
const {
  createProduct,
  uploadCloudGallery,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { file } = require("zod");
const uploadGalleryMiddleware = require("../middlewares/handleMulterError");

router.get("/", (req, res) => {
  res.send("Hello");
});
router.post(
  "/",
  uploadCloud.single("products"),
  validate(createProductSchema),
  createProduct,
);

router.post("/gallery", uploadGalleryMiddleware, uploadCloudGallery);

router.patch(
  "/:id",
  validate(updateProductSchema),
  uploadCloud.single("products"),
  updateProduct,
);

router.delete("/image", validate(deleteImageSchema, "query"), deleteProduct);
module.exports = router;
