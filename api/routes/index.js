const express = require("express");
const router = express.Router();

const productRouter = require("./product.route");

router.use("/products", productRouter);

module.exports = router;
