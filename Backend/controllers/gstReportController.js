const GSTreport = require("../models/GSTreport")

exports.getGSTReports = async (req, res) => {
  try {
    const gstreports = await GSTreport.find().populate('customer_id', 'name state_code').populate('supplier_id', 'name state_code')
    res.json(gstreports)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.addGSTReport = async (req, res) => {
  try {
    const gstreport = new GSTreport({...req.body, state: req.body.state || ""  })
    await gstreport.save()
    await gstreport.populate('customer_id', 'name state_code')
    await gstreport.populate('supplier_id', 'name state_code')

    res.json(gstreport)
  }
  catch (err) {
    res.status(500).json({ error: err.message })
  }
}


exports.deletegstReport = async (req, res) => {
  try {
    const deleted = await GSTreport.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Reports not found" });
    }
    res.json({ message: "Reports deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};