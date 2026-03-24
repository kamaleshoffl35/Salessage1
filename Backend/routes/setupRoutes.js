const express = require("express");
const router = express.Router();
const { saveSetup, getSetup } = require("../controllers/setupController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getSetup);
router.post("/", protect, saveSetup);

module.exports = router;