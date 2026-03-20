const express = require("express");
const router = express.Router();

const {
  getUnits,
  addUnit,
  deleteUnit,
  updateUnit,
} = require("../controllers/unitController");

const { protect } = require("../middleware/auth");

router.get("/", protect, getUnits);
router.post("/", protect, addUnit);
router.delete("/:id", protect, deleteUnit);
router.put("/:id", protect, updateUnit);

module.exports = router;