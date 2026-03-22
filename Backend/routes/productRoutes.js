const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  deleteProduct,
  checkProductExists,
  updateProduct,
  getProductById,
  bulkInsertProducts,
  getPublicProducts,
  getPublicProductById,
  getPublicSubcategories,
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/auth");
const {uploadProduct} = require("../middleware/upload");

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/public", getPublicProducts);
router.get("/public/subcategories", getPublicSubcategories);
router.get("/public/:id", getPublicProductById);
/* =========================
   PROTECTED ROUTES
========================= */
// Check if product exists
router.get("/check-exists",protect,authorize("super_admin", "admin", "user"),checkProductExists);
router.get("/",protect,authorize("super_admin", "admin", "user"),getProducts);
router.get("/:id",protect,authorize("super_admin", "admin", "user"),getProductById);
router.post("/",protect,authorize("super_admin", "admin"),upload.single("image"),addProduct);
router.post("/bulk",protect,authorize("super_admin", "admin"),bulkInsertProducts);
router.put("/:id",protect,authorize("super_admin", "admin"),uploadProduct.single("image"),updateProduct);
router.delete("/:id",protect,authorize("super_admin", "admin"),deleteProduct);
module.exports = router;