const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadProduct = multer({ storage: productStorage });
const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "payment_proofs",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadPayment = multer({ storage: paymentStorage });

const qrStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "payment_qr_codes",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadQR = multer({ storage: qrStorage });

const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "company_logos",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadLogo = multer({ storage: logoStorage });

const footerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "footer_images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const setupStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "setup",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadSetup = multer({ storage: setupStorage });

const uploadFooter = multer({ storage: footerStorage });
module.exports = {
  uploadProduct,
  uploadPayment,
  uploadQR,
  uploadLogo,
  uploadFooter, 
  uploadSetup,
};