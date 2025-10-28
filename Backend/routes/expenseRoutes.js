const express=require("express")
const{getexpenses,addexpense,deleteexpense, updateexpense}=require("../controllers/expenseController")
const {protect,authorize}=require("../middleware/auth")
const router=express.Router()

router.get("/",protect,authorize("super_admin","admin","user"),getexpenses)
router.post("/",protect,authorize("super_admin","admin"),addexpense)
router.delete("/:id",protect,authorize("super_admin"),deleteexpense)
router.put("/:id",protect,authorize("super_admin","admin"),updateexpense)

module.exports=router