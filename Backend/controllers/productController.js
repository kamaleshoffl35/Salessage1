const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    let products;
    if (req.user.role === "user") {
      products = await Product.find({ created_by_role: { $in: ["super_admin", "admin",] } })
        .populate("category_id", "name");
    } else {
      products = await Product.find().populate("category_id", "name");
    }
res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.addProduct = async (req, res) => {
  try {
    const product = new Product({...req.body,created_by_role: req.user.role,});
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.checkProductExists = async (req, res) => {
  const { name } = req.query;
  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }, 
    });
    res.json({ exists: !!product });
  } catch (err) {
    console.error("Error checking product:", err);
    res.status(500).json({ exists: false });
  }
};

