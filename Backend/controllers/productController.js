const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
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
  description,

  short_description,
  features,
  spiritual_significance,
  ideal_placement,
  care_instructions,
  tags,

  category_name,
  subcategory,        // ✅ NEW FIELD (1,2,3)
  subcategory_name,   // ✅ actual name

  brand_name,
  variant,
  dimension,
   dimensions,
  unit_id,
  warehouse,
  hsn_code,
  tax_rate_id,
  mrp,
  purchase_price,
  sale_price,
  status,
} = req.body;

  let warehouseId = null;
let warehouseName = null;

if (warehouse) {
  const w = await Warehouse.findById(warehouse)
    .select("store_name")
    .lean();

  if (w) {
    warehouseId = w._id;
    warehouseName = w.store_name;
  }
}
    const isPainting = category_name === "Paintings";
let parsedDimensions = [];

if (dimensions) {
  try {
    parsedDimensions = JSON.parse(dimensions);
  } catch {
    parsedDimensions = [];
  }
}
const existingSku = await Product.findOne({ sku });

if (existingSku) {
  return res.status(400).json({ error: "SKU already exists" });
}
const product = await Product.create({
  sku,
  name,
  description,
  short_description,
  features,
  spiritual_significance,
  ideal_placement,
  care_instructions,
  tags,

  category_name,
  subcategory: subcategory || null,
  subcategory_name: subcategory_name || null,

  brand_name,
  variant: isPainting ? null : variant,

  dimensions: isPainting ? parsedDimensions : [],

  warehouse: warehouseId,
  warehouse_name: warehouseName,

  unit_id,
  hsn_code,
  tax_rate_id,

  mrp: Number(mrp || 0),
  purchase_price: Number(purchase_price || 0),
  sale_price: Number(sale_price || 0),

  status,

  image: req.file?.path || null,

  created_by: req.user._id,
  created_by_name: req.user.name,
  created_by_role: req.user.role,
});
    res.json(product);
  } catch (err) {
  console.error("ADD PRODUCT ERROR:", err);
  res.status(400).json({ error: err.message });
}
};

exports.updateProduct = async (req, res) => {
  try {
    const user = req.user;
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    if (req.file) {
      allowedFields.image = req.file.path;
    }
    if (allowedFields.warehouse) {
      const warehouseDoc = await Warehouse.findById(allowedFields.warehouse).select("store_name");
      if (warehouseDoc) {
        allowedFields.warehouse_name = warehouseDoc.store_name;
      }
    }
    if (allowedFields.category_name) {
  const isPainting = allowedFields.category_name === "Paintings";

  if (isPainting) {
    allowedFields.variant = null;
  } else {
    allowedFields.dimension = null;
    allowedFields.dimensions = [];
  }
}
    allowedFields.updated_by = user._id;
    allowedFields.updated_by_name = user.name;
    allowedFields.updated_by_role = user.role;
    allowedFields.updatedAt = new Date();
    if (allowedFields.dimensions) {
  try {
    allowedFields.dimensions =
      typeof allowedFields.dimensions === "string"
        ? JSON.parse(allowedFields.dimensions)
        : allowedFields.dimensions;
  } catch {
    allowedFields.dimensions = [];
  }
}
if (allowedFields.subcategory === "") {
  allowedFields.subcategory = null;
}

if (allowedFields.subcategory_name === "") {
  allowedFields.subcategory_name = null;
}
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true }
    );
    res.json(updated);
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

exports.checkProductExists = async (req, res) => {
  const { name } = req.query;
  try {
    const product = await Product.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    res.json({ exists: !!product });
  } catch (err) {
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

exports.bulkInsertProducts = async (req, res) => {
  try {
    const user = req.user;
    const products = req.body.products;
    const operations = [];
    for (const p of products) {
      let warehouseDoc = await Warehouse.findOne({
        store_name: new RegExp(`^${p.warehouse?.trim()}$`, "i"),
      });

      if (!warehouseDoc) {
        warehouseDoc = await Warehouse.create({
          store_name: p.warehouse?.trim() || "Default",
        });
      }
      const isPainting = p.category_name === "Paintings";
      operations.push({
        updateOne: {
          filter: { sku: p.sku?.trim() },
          update: {
            $set: {
  sku: p.sku?.trim(),
  name: p.name?.trim(),

  description: p.description || "",
  short_description: p.short_description || "",
  features: p.features || "",
  spiritual_significance: p.spiritual_significance || "",
  ideal_placement: p.ideal_placement || "",
  care_instructions: p.care_instructions || "",
  tags: p.tags || "",

  category_name: p.category_name,
subcategory: p.subcategory || null,            // ✅ NEW
subcategory_name: p.subcategory_name || null, 
  brand_name: p.brand_name,
  variant: isPainting ? null : p.variant,
  dimension: isPainting ? p.dimension : null,
  dimensions: isPainting ? p.dimensions || [] : [],
  warehouse: warehouseDoc._id,
  warehouse_name: warehouseDoc.store_name,
  unit_id: p.unit_id,
  hsn_code: p.hsn_code,
  tax_rate_id: p.tax_rate_id,
  mrp: p.mrp,
  purchase_price: p.purchase_price,
  sale_price: p.sale_price,

  created_by: user._id,
  created_by_name: user.name,
  created_by_role: user.role,
}
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
      message: "All products stored successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= PUBLIC APIs (CHAKRAPANI WEBSITE) =================
exports.getPublicProducts = async (req, res) => {
  try {
    const { subcategory, subcategory_name } = req.query;

const filter = {
  category_name: "Paintings",
};

if (subcategory) {
  filter.subcategory = subcategory;
}

if (subcategory_name) {
  filter.subcategory_name = {
    $regex: new RegExp(subcategory_name, "i"),
  };
}
    const products = await Product.find(filter)
   .select(
  "name description short_description features spiritual_significance ideal_placement care_instructions tags image category_name subcategory subcategory_name brand_name variant dimension dimensions unit_id warehouse_name hsn_code tax_rate_id mrp purchase_price sale_price"
)
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
   .select(
  "name description short_description features spiritual_significance ideal_placement care_instructions tags image category_name subcategory subcategory_name brand_name variant dimension dimensions unit_id warehouse_name hsn_code tax_rate_id mrp purchase_price sale_price"
)
      .lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getPublicSubcategories = async (req, res) => {
  try {
    const products = await Product.find({
      category_name: "Paintings",
    }).select(" subcategory_name");
    const subcategories = [
      ...new Set(
        products
          .map((p) => p.subcategory_name)
          .filter((s) => typeof s === "string" && s.trim() !== "")
      ),
    ];
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.getPublicSubcategories = async (req, res) => {
//   try {
//     const products = await Product.find({
//       category_name: "Paintings",
//     }).select("subcategory subcategory_name");

//     const grouped = {};

//     products.forEach((product) => {
//       const sub = product.subcategory;
//       const subName = product.subcategory_name;

//       if (!sub || !subName) return;

//       if (!grouped[sub]) {
//         grouped[sub] = new Set();
//       }

//       grouped[sub].add(subName);
//     });

//     const result = Object.keys(grouped).map((key) => ({
//       subcategory: key,
//       subcategory_names: [...grouped[key]],
//     }));

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };