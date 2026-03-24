const Setup = require("../models/Setup");

exports.saveSetup = async (req, res) => {
  try {
    let data = {};
    data.title = JSON.parse(req.body.title || '""');
    data.tagline = JSON.parse(req.body.tagline || '""');
    data.description = JSON.parse(req.body.description || '""');
    data.phone = JSON.parse(req.body.phone || '""');
    data.email = JSON.parse(req.body.email || '""');
    data.address = JSON.parse(req.body.address || '""');

    data.modules = JSON.parse(req.body.modules || "[]");
    data.offers = JSON.parse(req.body.offers || "[]");
    data.quickLinks = JSON.parse(req.body.quickLinks || "[]");
    data.socialLinks = JSON.parse(req.body.socialLinks || "{}");
    data.customerCare = JSON.parse(req.body.customerCare || "[]");

    data.footerDescription = JSON.parse(req.body.footerDescription || '""');
    data.developedBy = JSON.parse(req.body.developedBy || '""');
    data.copyright = JSON.parse(req.body.copyright || '""');
    if (req.files?.logo) {
      data.logo = req.files.logo[0].path;
    }
    if (req.files?.footerCardImage) {
      data.footerCardImage = req.files.footerCardImage[0].path;
    }
    let setup = await Setup.findOne();

    if (setup) {
      setup = await Setup.findByIdAndUpdate(setup._id, data, {
        new: true,
      });
    } else {
      setup = await Setup.create(data);
    }

    res.json(setup);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Setup save failed" });
  }
};

exports.getSetup = async (req, res) => {
  try {
    const setup = await Setup.findOne();
    res.json(setup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};