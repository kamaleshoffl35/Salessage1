const express = require("express");
const router = express.Router();

const tenantMiddleware = require("../middleware/tenantMiddleware");

const {
  getCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/auth");

// 🔐 First identify tenant
router.use(tenantMiddleware);

// 🔐 Then verify user token
router.use(protect);

// Cart Routes
router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/increase/:itemId", increaseQty);
router.patch("/decrease/:itemId", decreaseQty);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;