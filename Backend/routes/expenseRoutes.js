const express=require("express")
const{getexpenses,addexpense,deleteexpense, updateexpense, getExpenseById}=require("../controllers/expenseController")
const {protect,authorize}=require("../middleware/auth")
const router=express.Router()

router.get("/",protect,authorize("super_admin","admin","user"),getexpenses)
router.post("/",protect,authorize("super_admin","admin"),addexpense)
router.delete("/:id",protect,authorize("super_admin"),deleteexpense)
router.put("/:id",protect,authorize("super_admin","admin"),updateexpense)
router.get("/:id",protect,authorize("super_admin","admin","user"),getExpenseById)
module.exports=router