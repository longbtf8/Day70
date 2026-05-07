const { z } = require("zod");

const createProductSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự" })
    .max(100, { message: "Tên sản phẩm không được vượt quá 100 ký tự" }),

  price: z.coerce
    .number({
      invalid_type_error: "Gía phải là một số",
      required_error: "Vui lòng nhập giá sản phẩm",
    })
    .positive({ message: "Giá sản phẩm phải lớn hơn 0" }),

  stock: z.coerce
    .number({
      invalid_type_error: "Số Lượng phải là một số",
    })
    .nonnegative({ message: "Số lượng không được âm" })
    .optional()
    .default(0),

  description: z
    .string()
    .max(500, { message: "Mô tả không được vượt quá 500 ký tự" })
    .optional(),

  oldImageUrl: z.string().optional(),
});
const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Dữ liệu cập nhật không được để trống",
  });

const deleteImageSchema = z.object({
  publicId: z.string().min(1, { message: "publicId không được để trống" }),
});
module.exports = {
  createProductSchema,
  updateProductSchema,
  deleteImageSchema,
};
