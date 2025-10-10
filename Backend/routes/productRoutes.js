const express = require("express");
const {
  getProducts,
  addProduct,
  deleteProduct,
  checkProductExists,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

// Always put specific routes (like /check-exists) before "/"
router.get("/check-exists", protect, authorize("super_admin", "admin", "user"), checkProductExists);
router.get("/", protect, authorize("super_admin", "admin", "user"), getProducts);
router.post("/", protect, authorize("super_admin", "admin"), addProduct);
router.delete("/:id", protect, authorize("super_admin", "admin"), deleteProduct);

module.exports = router;
