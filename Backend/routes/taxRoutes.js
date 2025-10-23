const express = require("express");
const {getTaxes, addTax, deletetax, updatetax} = require("../controllers/taxController");
const {protect,authorize}=require("../middleware/auth")
const router = express.Router();

router.get("/",protect,authorize("super_admin","admin","user") ,getTaxes);
router.post("/",protect,authorize("super_admin","admin"), addTax);
router.delete("/:id",protect,authorize("super_admin","admin"),deletetax)
router.put("/:id",protect,authorize("super_admin","admin"),updatetax)


module.exports = router;
