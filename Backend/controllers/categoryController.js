const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("created_by", "name email")
      .populate("updated_by", "name email");

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {

    const {
      category_name,
      subcategory,
      subcategory1,
      status
    } = req.body;

    const category = await Category.create({
      category_name,
      subcategory,
      subcategory1,

      status,

      created_by: req.user._id,
      created_by_name: req.user.name,
      created_by_role: req.user.role
    });

    res.json(category);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,

        updated_by: req.user._id,
        updated_by_name: req.user.name,
        updated_by_role: req.user.role,
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(400).json({ error: err.message });
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