const Unit = require("../models/Unit");

exports.getUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUnit = async (req, res) => {
  try {
    const unit = new Unit({
      ...req.body,
      created_by: req.user._id,
      created_by_name: req.user.name,
    });

    await unit.save();
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: "Unit deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const oldUnit = await Unit.findById(req.params.id);

    const updated = await Unit.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updated_by: req.user._id,
        updated_by_name: req.user.name,
        history: {
          oldValue: oldUnit.unit_name,
          newValue: req.body.unit_name,
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};