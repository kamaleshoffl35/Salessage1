const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    let categories;

    if (req.user.role === "user") {
      categories = await Category.find({
        created_by_role: { $in: ["super_admin", "admin"] }
      }).populate("created_by", "name email role");
    } else {
      categories = await Category.find()
        .populate("created_by", "name email role");
    }

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.addCategory=async(req,res)=>{
  try {
    const {parental_id,name,code,subcategory,brands = [],status}=req.body;

    const category = new Category({parental_id,name,code,subcategory,brands,status,created_by:req.user._id,created_by_role:req.user.role});

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Error saving category:", err);
    res.status(400).json({ message: err.message });
  }
};



exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
 const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldCategory.name,       
      newValue: req.body.name || oldCategory.name, 
    };

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true }
    ).populate("created_by", "name email role")
      .populate("updated_by", "name email role");

    res.json(updated);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getSubcategoriesByCategoryId = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({
      subcategories: category.subcategory ? [category.subcategory] : [],
      brands: category.brands || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req,res) => {
  try{
   const category = await Category.findById(req.params.id)
  .populate("created_by", "name email role")
  .populate("updated_by", "name email role");

    if(!category){
      return res.status(404).json({error:"Category not found"})
    }
    res.json(category)
  }
  catch(err){
    res.status(500).json({error:"Server error"})
  }
}