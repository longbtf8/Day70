const createProduct = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Vui lòng upload ảnh sản phẩm ",
    });
  }
  const imageUrl = req.file?.path;
  const { name, price, stock, description } = req.body;
  const newProduct = {
    name,
    price,
    stock,
    description,
    imageUrl,
  };
  return res.status(201).json({
    message: "Tạo sản phẩm thành công",
    data: newProduct,
  });
};
const uploadCloudGallery = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "Vui lòng chọn ít nhất 1 ảnh ",
    });
  }
  const imageUrls = req.files.map((file) => file.path);

  console.log(req.files);
  res.status(200).json({
    message: `Upload thành công ${req.files.length}`,
    urls: imageUrls,
  });
};

const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    // const existingProduct = await ProductModel.findById(id);
    const isExist = true; // tạm thời
    if (!isExist) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    const { name, price, stock, description, oldImageUrl } = req.body;

    let finalImageUrl = "";

    if (req.file) {
      finalImageUrl = req.file.path;
    } else {
      finalImageUrl = oldImageUrl;
    }

    // nếu có database thì lưu trữ ở đây , còn em không viết lên chỉ thực hành theo yêu cầu
    const updatedData = {
      id,
      name,
      price,
      stock,
      description,
      imageUrl: finalImageUrl,
    };

    return res.status(200).json({
      message: "Cập nhật thành công",
      data: updatedData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { publicId } = req.query;
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      return res.status(400).json({
        message: "Không tìm thấy ảnh hoặc publicId không hợp lệ",
      });
    }
    return res.status(200).json({
      message: "Xoá ảnh thành công",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};
module.exports = {
  createProduct,
  uploadCloudGallery,
  updateProduct,
  deleteProduct,
};
