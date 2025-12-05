const Warehouse = require("../models/Warehouse");

exports.getWarehouses = async (req, res) => {
  try {
    let warehouses;
    if (req.user.role) {
      warehouses = await Warehouse.find({
        created_by_role: { $in: ["super_admin", "admin"] },
      }).populate("created_by", "name email role");
    } else {
      warehouses = await Warehouse.find().populate(
        "created_by",
        "name email role"
      );
    }
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse({
      ...req.body,
      created_by: req.user._id,
      created_by_role: req.user.role,
    });
    await warehouse.save();
    res.json(warehouse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    const deleted = await Warehouse.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateWarehouse = async (req, res) => {
  try {
    const oldWarehouse = await Warehouse.findById(req.params.id);
    if (!oldWarehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    const allowedFields = { ...req.body };
    delete allowedFields.id;
    delete allowedFields._id;
    allowedFields.updated_by = req.user._id;
    allowedFields.updated_by_role = req.user.role;
    allowedFields.updatedAt = new Date();
    allowedFields.history = {
      oldValue: oldWarehouse.name,
      newValue: req.body.name || oldWarehouse.name,
    };

    const updated = await Warehouse.findByIdAndUpdate(
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

exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate("created_by", "name email role")
      .populate("updated_by", "name email role");
    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    return res.json(warehouse);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
