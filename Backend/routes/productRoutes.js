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

// const express = require("express");
// const {
//   getProducts,
//   addProduct,
//   deleteProduct,
//   checkProductExists,
//   updateProduct,
//   getProductById,
//   bulkInsertProducts,
//   getPublicProducts,
//   getPublicCategories,
//   getPublicProductById,
//   getPublicProductsByCategory
// } = require("../controllers/productController");

// const { protect, authorize } = require("../middleware/auth");
// const upload = require("../middleware/upload");
// const router = express.Router();
// router.get("/public", getPublicProducts);
// router.get("/public-categories", getPublicCategories);
// router.get("/check-exists", protect, authorize("super_admin", "admin", "user"), checkProductExists);
// router.get("/", protect, authorize("super_admin", "admin", "user"), getProducts);
// router.post("/", protect, authorize("super_admin", "admin"), addProduct);
// router.post("/bulk", protect, authorize("super_admin", "admin"), bulkInsertProducts);
// router.put("/id/:id", protect, authorize("super_admin", "admin"), updateProduct);
// router.delete("/id/:id", protect, authorize("super_admin", "admin"), deleteProduct);
// router.get("/id/:id", protect, authorize("super_admin", "admin", "user"), getProductById);
// router.get("/public/category/:category", getPublicProductsByCategory);
// router.get("/public/:id", getPublicProductById);
// router.post("/", protect, upload.single("image"), addProduct);
// router.put("/:id", protect, upload.single("image"), updateProduct);
// module.exports = router;

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
  getPublicCategories,
  getPublicProductById,
  getPublicProductsByCategory,
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");


/* =========================
   PUBLIC ROUTES
========================= */

router.get("/public", getPublicProducts);

router.get("/public-categories", getPublicCategories);

router.get("/public/category/:category", getPublicProductsByCategory);

router.get("/public/:id", getPublicProductById);


/* =========================
   PROTECTED ROUTES
========================= */

// Check if product exists
router.get(
  "/check-exists",
  protect,
  authorize("super_admin", "admin", "user"),
  checkProductExists
);

// Get all products
router.get(
  "/",
  protect,
  authorize("super_admin", "admin", "user"),
  getProducts
);

// Get single product
router.get(
  "/:id",
  protect,
  authorize("super_admin", "admin", "user"),
  getProductById
);

// Add product (WITH IMAGE UPLOAD)
router.post(
  "/",
  protect,
  authorize("super_admin", "admin"),
  upload.single("image"),
  addProduct
);

// Bulk insert (NO IMAGE)
router.post(
  "/bulk",
  protect,
  authorize("super_admin", "admin"),
  bulkInsertProducts
);

// Update product (WITH IMAGE SUPPORT)
router.put(
  "/:id",
  protect,
  authorize("super_admin", "admin"),
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  protect,
  authorize("super_admin", "admin"),
  deleteProduct
);

module.exports = router;