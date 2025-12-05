const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    let products;
    if (req.user.role === "user") {
      products = await Product.find({
        created_by_role: { $in: ["super_admin", "admin"] },
      }).populate("category_id", "name");
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
    const {
      sku,
      name,
      category_id,
      brand_name,
      variant,
      unit_id,
      hsn_code,
      tax_rate_id,
      mrp,
      purchase_price,
      sale_price,
      min_stock,
      barcode,
      is_batch_tracked,
      is_serial_tracked,
      status,
    } = req.body;

    const product = new Product({
      sku,
      name,
      category_id,
      brand_name,
      variant,
      unit_id,
      hsn_code,
      tax_rate_id,
      mrp,
      purchase_price,
      sale_price,
      min_stock,
      barcode,
      is_batch_tracked,
      is_serial_tracked,
      status,
      created_by: req.user._id,
      created_by_role: req.user.role,
    });

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
    const user = req.user;
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = user._id;
    allowedFields.updated_by_role = user.role;
    allowedFields.updatedAt = new Date();
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true }
    ).populate("created_by updated_by", "name username email");
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

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "created_by updated_by",
      "name email role"
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
