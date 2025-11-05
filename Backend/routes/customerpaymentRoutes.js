const express=require("express")
const {getCustomerPayments,}=require("../controllers/customerpaymentController")
const {protect,authorize}=require("../middleware/auth")
const router=express.Router()
router.get("/",protect,authorize("super_admin","admin","user"),getCustomerPayments)

module.exports=router