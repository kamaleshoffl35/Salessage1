const express = require("express");
const router = express.Router();
const { saveSetup, getSetup } = require("../controllers/setupController");
const { protect } = require("../middleware/auth");
const { uploadSetup } = require("../middleware/upload");
router.get("/", protect, getSetup);
router.post(
  "/",
  protect,
  uploadSetup.fields([
    { name: "logo", maxCount: 1 },
    { name: "footerCardImage", maxCount: 1 },
  ]),
  saveSetup
);

module.exports = router;