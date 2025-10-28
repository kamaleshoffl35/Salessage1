const express=require("express")
const {getStockledger,postStockledger,deleteStockledger, updateStockledger}=require("../controllers/stockledgerController")
const {protect,authorize}=require("../middleware/auth")
const router=express.Router()
router.get("/",protect,authorize("super_admin","admin","user"),getStockledger)
router.post("/",protect,authorize("super_admin"),postStockledger)
router.delete("/:id",protect,authorize("super_admin"),deleteStockledger)
router.put("/:id",protect,authorize("super_admin"),updateStockledger)

module.exports=router