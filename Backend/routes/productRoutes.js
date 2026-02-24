// const express = require("express");
// const {getProducts,addProduct,deleteProduct,checkProductExists,updateProduct,getProductById,bulkInsertProducts}=require("../controllers/productController");
// const {protect,authorize}=require("../middleware/auth");
// const router = express.Router();
// router.get("/check-exists", protect, authorize("super_admin", "admin", "user"), checkProductExists);
// router.get("/", protect, authorize("super_admin", "admin", "user"), getProducts);
// router.post("/", protect, authorize("super_admin", "admin"), addProduct);
// router.put("/:id", protect, authorize("super_admin", "admin"), updateProduct);
// router.delete("/:id", protect, authorize("super_admin", "admin"), deleteProduct);
// router.get("/:id", protect, authorize("super_admin", "admin", "user"), getProductById);
// router.post("/bulk", protect,authorize("super_admin", "admin"), bulkInsertProducts);
// router.get("/public", getPublicProducts);
// module.exports = router;

const express = require("express");
const {
  getProducts,
  addProduct,
  deleteProduct,
  checkProductExists,
  updateProduct,
  getProductById,
  bulkInsertProducts,
  getPublicProducts,
  getPublicCategories,
  getPublicProductById,
  getPublicProductsByCategory
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// ✅ PUBLIC ROUTE FIRST
router.get("/public", getPublicProducts);
router.get("/public-categories", getPublicCategories);

// PROTECTED ROUTES
router.get("/check-exists", protect, authorize("super_admin", "admin", "user"), checkProductExists);
router.get("/", protect, authorize("super_admin", "admin", "user"), getProducts);
router.post("/", protect, authorize("super_admin", "admin"), addProduct);
router.post("/bulk", protect, authorize("super_admin", "admin"), bulkInsertProducts);
router.put("/id/:id", protect, authorize("super_admin", "admin"), updateProduct);
router.delete("/id/:id", protect, authorize("super_admin", "admin"), deleteProduct);
router.get("/id/:id", protect, authorize("super_admin", "admin", "user"), getProductById);
router.get("/public/category/:category", getPublicProductsByCategory);
router.get("/public/:id", getPublicProductById);
module.exports = router;