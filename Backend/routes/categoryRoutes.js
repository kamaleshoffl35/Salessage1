const express = require("express");
const { getCategories, addCategory, deleteCategory, getSubcategoriesByCategoryId, updateCategory, getCategoryById } = require("../controllers/categoryController");
const {protect,authorize}=require("../middleware/auth")
const router = express.Router();
router.get("/", protect,authorize("super_admin","admin","user") ,getCategories);
router.post("/", protect,authorize("super_admin","admin"), addCategory);
router.delete("/:id",protect,authorize("super_admin","admin"), deleteCategory);
router.put("/:id",protect,authorize("super_admin","admin"),updateCategory)
router.get("/subcategories/:id",protect,authorize("super_admin","admin","user"), getSubcategoriesByCategoryId);
router.get("/:id",protect,authorize("super_admin","admin","user"),getCategoryById)
module.exports = router;
