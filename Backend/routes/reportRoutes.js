const express = require("express");
const {getSaleReports,addSaleReport, deleteSaleReport} = require("../controllers/saleReportController");
const {getPurchaseReports,addPurchaseReport, deletePurchaseReport} = require("../controllers/purchaseReportController");


const { getProfitLoss } = require("../controllers/profitlossController");
const {protect,authorize}=require("../middleware/auth")
const { getSalesByDateRange } = require("../controllers/saleposController");
const { getSaleReturnReports } = require("../controllers/salereturnReportController");
const router = express.Router();  

router.get("/sales",protect,authorize("super_admin","admin","user"), getSaleReports);
router.get("/purchase",protect,authorize("super_admin","admin","user"), getPurchaseReports);
router.get("/salesreturns",protect,authorize("super_admin","admin"),getSaleReturnReports)



router.get("/profitloss",getProfitLoss)
module.exports = router;   
