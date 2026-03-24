const Setup = require("../models/Setup");

// CREATE or UPDATE (Single record per system)
exports.saveSetup = async (req, res) => {
  try {
    let existing = await Setup.findOne();

    if (existing) {
      const updated = await Setup.findByIdAndUpdate(
        existing._id,
        req.body,
        { new: true }
      );
      return res.json(updated);
    }

    const newSetup = new Setup({
      ...req.body,
      createdBy: req.user._id,
    });

    await newSetup.save();
    res.status(201).json(newSetup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET
exports.getSetup = async (req, res) => {
  try {
    const setup = await Setup.findOne();
    res.json(setup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};