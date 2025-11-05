const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    let categories
    if(req.user.role ===  "user"){
     categories=await Category.find({created_by_role: {$in:["super_admin","admin"]}})
    }
    else{
      categories=await Category.find()
    }
      
   res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.addCategory=async(req,res)=>{
  try {
    const {parental_id,name,code,subcategory,brands = [],status}=req.body;

    const category = new Category({parental_id,name,code,subcategory,brands,status,created_by_role:req.user.role});

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

exports.updateCategory = async(req, res)=>{
  try{
    const updated=await Category.findByIdAndUpdate(req.params.id, req.body,{new:true})
    res.json(updated)
  }
  catch(err){
    res.status(400).json({error:err.message})
  }
}

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
