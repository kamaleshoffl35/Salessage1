const express = require("express");
const router = express.Router();
const {addSalesReturn,getSalesReturns,getSalesReturnById, updateSalesReturn, deleteSalesReturn}= require('../controllers/salereturnController')
const { protect} = require("../middleware/auth")
router.post("/", protect,addSalesReturn);
router.get("/", protect, getSalesReturns);
router.get("/:id", protect, getSalesReturnById);
router.put("/:id", protect, updateSalesReturn);
router.delete("/:id", protect, deleteSalesReturn);
module.exports = router;
