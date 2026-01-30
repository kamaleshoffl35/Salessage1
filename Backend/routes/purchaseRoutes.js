const express = require("express");
const {
  getPurchases,
  addPurchase,
  deletePurchase,
  updatePurchase,
  getPurchaseById,
} = require("../controllers/purchaseController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("super_admin", "admin", "user"), getPurchases);
router.post("/", protect, authorize("super_admin", "admin"), addPurchase);
router.get("/:id", protect, authorize("super_admin", "admin", "user"), getPurchaseById);
router.put("/:id", protect, authorize("super_admin", "admin"), updatePurchase);
router.delete("/:id", protect, authorize("super_admin", "admin"), deletePurchase);

module.exports = router; // ✅ ONLY THIS
