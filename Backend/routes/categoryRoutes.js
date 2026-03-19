const express = require("express");

const router = express.Router();

const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("super_admin","admin","user"), getCategories);

router.post("/", protect, authorize("super_admin","admin"), addCategory);

router.put("/:id", protect, authorize("super_admin","admin"), updateCategory);

router.delete("/:id", protect, authorize("super_admin","admin"), deleteCategory);

module.exports = router;