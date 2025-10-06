const express=require("express")
const {getStockledger,postStockledger,deleteStockledger}=require("../controllers/stockledgerController")

const router=express.Router()
router.get("/",getStockledger)
router.post("/",postStockledger)
router.delete("/:id",deleteStockledger)

module.exports=router