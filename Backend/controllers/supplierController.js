const Supplier = require("../models/Supplier");

exports.getSuppliers = async (req, res) => {
  try {
    let suppliers;
    if (req.user.role === "user") {
      suppliers = await Supplier.find({
        created_by_role: { $in: ["super_admin", "admin"] },
      }).populate("created_by", "name email role").populate("updated_by","name email")
    } else {
      suppliers = await Supplier.find().populate("created_by","name email role");
    }
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    const supplier = new Supplier({...req.body,created_by: req.user._id,created_by_name:req.user.name,created_by_role: req.user.role,});
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
  console.error("Error saving supplier", err);

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Mobile number already exists"
    });
  }

  res.status(500).json({
    message: "Server error"
  });
}
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const oldSupplier = await Supplier.findById(req.params.id);
    if (!oldSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_name=req.user.name,
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldSupplier.name,
      newValue: req.body.name || oldSupplier.name,
    };
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true }
    )
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    return res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
