const express=require("express")
const {getStockAdjustment,addStockAdjustment, deleteStockAdjustment, updateStockAdjustment} = require('../controllers/stockAdjustment')
const {protect,authorize}=require("../middleware/auth")
const router=express.Router()
router.get("/",protect,authorize("super_admin","admin","user"),getStockAdjustment)
router.post("/",protect,authorize("super_admin","admin","user"),addStockAdjustment)
router.delete("/:id",protect,authorize("super_admin","admin"),deleteStockAdjustment)
router.put("/:id",protect,authorize("super_admin","admin"),updateStockAdjustment)
module.exports=router