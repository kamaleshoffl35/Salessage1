const express = require("express");
const {getProducts,addProduct,deleteProduct,checkProductExists,updateProduct}=require("../controllers/productController");
const {protect,authorize}=require("../middleware/auth");
const router = express.Router();
router.get("/check-exists", protect, authorize("super_admin", "admin", "user"), checkProductExists);
router.get("/", protect, authorize("super_admin", "admin", "user"), getProducts);

router.post("/", protect, authorize("super_admin", "admin"), addProduct);
router.put("/:id", protect, authorize("super_admin", "admin"), updateProduct);

router.delete("/:id", protect, authorize("super_admin", "admin"), deleteProduct);

module.exports = router;
