const express =require("express")
const {getSupplierPayments}=require("../controllers/supplierpaymentController")
const {protect,authorize}=require("../middleware/auth")
const router=express.Router()
router.get("/",protect,authorize("super_admin","admin","user"),getSupplierPayments)

module.exports=router
