const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* ================================
   Product Image Upload
================================ */

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadProduct = multer({ storage: productStorage });

/* ================================
   Payment Screenshot Upload
================================ */

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "payment_proofs",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadPayment = multer({ storage: paymentStorage });

module.exports = {
  uploadProduct,
  uploadPayment,
};