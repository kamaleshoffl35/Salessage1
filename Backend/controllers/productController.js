const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const User = require("../models/User");
const GoogleCategory = require("../models/GoogleCategory");

exports.getProducts = async (req, res) => {
  try {
    const query =
      req.user.role === "user"
        ? { created_by_role: { $in: ["super_admin", "admin"] } }
        : {};
    const products = await Product.find(query)
      .populate("warehouse", "store_name")
      .populate("created_by", "name email")
      .populate("updated_by", "name email");
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
      subcategory_id,
      brand_name,
      variant,
      unit_id,
      warehouse,
      hsn_code,
      tax_rate_id,
      mrp,
      purchase_price,
      sale_price,
      min_stock,
      barcode,
      status,
    } = req.body;
    const warehouseDoc = await Warehouse.findById(warehouse).select("store_name");
    const categoryDoc = await GoogleCategory.findById(category_id).select("name");
    const subCategoryDoc = subcategory_id ? await GoogleCategory.findById(subcategory_id).select("name") : null;
    const product = new Product({
      sku,
      name,
      category_id,
      category_name: categoryDoc?.name,
      subcategory_id: subcategory_id || null,
      subcategory_name: subCategoryDoc?.name || null,
      brand_name,
      variant,
      warehouse: warehouseDoc._id,
      warehouse_name: warehouseDoc.store_name,
      unit_id,
      hsn_code,
      tax_rate_id,
      mrp,
      purchase_price,
      sale_price,
      min_stock,
      barcode,
      status,
      created_by: req.user._id,
      created_by_name: req.user.name,
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
    allowedFields.updated_by_name = user.name;
    allowedFields.updated_by_role = user.role;
    allowedFields.updatedAt = new Date();
    if (allowedFields.warehouse) {
      const warehouseDoc = await Warehouse.findById(allowedFields.warehouse,).select("store_name");
      if (warehouseDoc) {
        allowedFields.warehouse_name = warehouseDoc.store_name;
      }
    }
    if (allowedFields.category_id) {
      const cat = await GoogleCategory.findById(allowedFields.category_id,).select("name");
      if (cat) 
        allowedFields.category_name = cat.name;
    }

    if (allowedFields.subcategory_id) {
      const sub = await GoogleCategory.findById(allowedFields.subcategory_id, ).select("name");
      if (sub) 
        allowedFields.subcategory_name = sub.name;
    }
    const updated = await Product.findByIdAndUpdate(req.params.id,allowedFields,{ new: true },);
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
      "name email role",
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.bulkInsertProducts = async (req, res) => {
  try {
    const user = req.user;
    const products = req.body.products;
    const operations = [];
    for (const p of products) {
      let warehouseDoc = await Warehouse.findOne({store_name: new RegExp(`^${p.warehouse?.trim()}$`, "i"),});
      if (!warehouseDoc) {
        warehouseDoc = await Warehouse.create({store_name: p.warehouse?.trim() || "Default",});
      }
      let categoryDoc = await GoogleCategory.findOne({
        name: new RegExp(`^${p.category_name?.trim()}$`, "i"),
      });
      if (!categoryDoc) {
        categoryDoc = await GoogleCategory.create({
          name: p.category_name?.trim() || "General",
        });
      }
      operations.push({
        updateOne: {
          filter: { sku: p.sku?.trim() }, 
          update: {
            $set: {
              ...p,
              sku: p.sku?.trim(),
              name: p.name?.trim(),
              warehouse: warehouseDoc._id,
              warehouse_name: warehouseDoc.store_name,
              category_id: categoryDoc._id,
              category_name: categoryDoc.name,
              created_by: user._id,
              created_by_name: user.name,
              created_by_role: user.role,
            },
          },
          upsert: true, 
        },
      });
    }
    const result = await Product.bulkWrite(operations);
    res.json({
      totalRows: products.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      message: "All products stored successfully (no skips)",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("name category_name sale_price mrp brand_name")
      .lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};