const express = require('express')
const {getSuppliers,addSupplier, deleteSupplier, updateSupplier} = require("../controllers/supplierController")
const {protect,authorize}=require("../middleware/auth")
const router =express.Router()
router.get("/",protect,authorize("super_admin","admin","user"),getSuppliers)
router.post("/",protect,authorize("super_admin","admin"),addSupplier)
router.delete("/:id",protect,authorize("super_admin","admin"),deleteSupplier)
router.put("/:id",protect,authorize("super_admin","admin"),updateSupplier)

module.exports = router