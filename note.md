# Buổi học: Upload File & Validate trên Server

client -(req tạo mới sản phẩm, kèm file ảnh)-> server (Express) -(req)-> Multer -> req.file -(đường dẫn file)-> object product { name, price, imageUrl } -> lưu vào database -> trả về response

Có 2 cách để tạo mới sản phẩm:

- Cách 1: req tạo mới sản phẩm, kèm file ảnh ... -> trả về response object product { name, price, imageUrl }
- Cách 2: Thực hiện 2 req:
  - req lưu ảnh lên server, trả về URL ảnh
  - req tạo mới sản phẩm, kèm URL ảnh

## Phần 1: Upload file với Multer (local storage)

Định nghĩa: Multer là middleware cho Express xử lý `multipart/form-data` — định dạng dùng để upload file từ client lên server.

Cài đặt:

```bash
npm install multer
```

Ví dụ cơ bản:

```js
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // thư mục lưu file
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

C:\Users\YourUsername\Documents\uploads\product-1.png

const upload = multer({ storage });

// Route upload single file
app.post("/api/avatar", upload.single("avatar"), (req, res) => {
  console.log(req.file); // thông tin file vừa upload
  res.json({ url: `/uploads/${req.file.filename}` });
});
```

Filter file theo loại:

```js
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // chấp nhận
    } else {
      cb(new Error("Chỉ cho phép upload ảnh"), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // tối đa 2MB
});
```

Xử lý lỗi Multer:

```js
app.post("/api/avatar", (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
});
```

> Lưu ý: `req.file` chứa thông tin file single upload. `req.files` dùng khi upload nhiều file với `.array()` hoặc `.fields()`.

---

## Phần 2: Upload file lên Cloudinary

Định nghĩa: Thay vì lưu file trên server local, Cloudinary là dịch vụ cloud lưu trữ và tối ưu media (ảnh, video). `multer-storage-cloudinary` giúp tích hợp trực tiếp với Multer.

Cài đặt:

```bash
npm install cloudinary multer-storage-cloudinary
```

Cấu hình Cloudinary:

```js
// cloudinary.config.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default cloudinary;
```

Tạo storage và middleware:

```js
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config.js";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "webp"],
  },
});

export const upload = multer({ storage });
```

Dùng trong route:

```js
app.post("/api/avatar", upload.single("avatar"), (req, res) => {
  // req.file.path chính là Cloudinary URL
  res.json({ url: req.file.path });
});
```

> Lưu ý: Khác với diskStorage, `req.file.path` khi dùng Cloudinary trả về URL đầy đủ của file trên cloud, không phải đường dẫn local. Nhớ đặt credentials vào `.env`, không commit lên git.

---

## Phần 3: Validate với express-validator

Định nghĩa: `express-validator` là thư viện validate dữ liệu request trong Express theo kiểu chain — gắn validation rules vào từng field của `body`, `param`, `query`.

Cài đặt:

```bash
npm install express-validator
```

Ví dụ validate route đăng ký:

```js
import { body, validationResult } from "express-validator";

const validateRegister = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu tối thiểu 8 ký tự"),
  body("username")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username không được chứa ký tự đặc biệt"),
];

app.post("/api/register", validateRegister, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // xử lý tiếp...
});
```

Custom validator — kiểm tra email đã tồn tại:

```js
body("email")
  .isEmail()
  .withMessage("Email không hợp lệ")
  .custom(async (value) => {
    const user = await User.findOne({ email: value });
    if (user) throw new Error("Email đã được sử dụng");
  });
```

> Lưu ý: `validationResult(req)` chỉ đọc lỗi, không tự throw. Phải tự kiểm tra `.isEmpty()` và trả response. Nên tách validation rules ra file riêng `validators/user.js` cho dễ tái sử dụng.

---

## Phần 4: Validate với Zod

Định nghĩa: Zod là thư viện validation theo hướng schema-first, TypeScript-native. Thay vì chain rules vào từng field, bạn định nghĩa toàn bộ shape của data trong một schema object.

Cài đặt:

```bash
npm install zod
```

Tạo schema và validate:

```js
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, "Username không được chứa ký tự đặc biệt"),
});
```

{email, } = req.body

Dùng `.safeParse()` trong middleware:

```js
app.post("/api/register", validateRegister, (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  const data = result.data; // đã được validate và typed
  // xử lý tiếp...
});
```

Tạo middleware wrapper tái sử dụng:

```js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  req.body = result.data;
  next();
};

// Dùng:
app.post("/api/register", validate(registerSchema), registerHandler);
```

Infer TypeScript type từ schema:

```ts
type RegisterInput = z.infer<typeof registerSchema>;
// { email: string; password: string; username: string }
```

> Lưu ý: `.parse()` sẽ throw nếu data không hợp lệ. `.safeParse()` trả về `{ success, data, error }` — an toàn hơn để dùng trong middleware. Zod còn hỗ trợ `.transform()` để vừa validate vừa biến đổi data (ví dụ trim whitespace, lowercase email).
