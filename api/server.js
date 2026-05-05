require("dotenv").config();
const express = require("express");
const upload = require("./middlewares/upload");
const uploadCloud = require("./middlewares/uploadCloud");
const app = express();
const port = 3000;
const apiRoute = require("./routes/index");

app.use(express.json());
app.use("/api", apiRoute);
app.use(express.static("public"));
app.post("/upload-file", upload.array("avatar"), (req, res) => {
  console.log(req.files);
});

app.post("/upload-file-cloud", uploadCloud.single("avatar"), (req, res) => {
  console.log(req.file);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
