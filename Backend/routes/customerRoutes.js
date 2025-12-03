const express = require("express");
const {getCustomers,addCustomer,deleteCustomer, updateCustomer} = require("../controllers/customerController");
const router = express.Router();
router.get("/", getCustomers);
router.post("/", addCustomer);
router.delete("/:id",deleteCustomer);
router.put("/:id",updateCustomer)
module.exports = router;