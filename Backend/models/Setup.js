const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tagline: String,
    description: String,
    logo: String,
    phone: String,
    email: String,
    address: String,
    socialLinks: {
      instagram: String,
      whatsapp: String,
      facebook: String,
    },
    modules: [
      {
        name: String,
        subModules: [
          {
            name: String,
          },
        ],
      },
    ],
    offers: [
      {
        description: String,
      },
    ],
    footerDescription: String,
    footerCardImage: String,
    developedBy: String,
    copyright: String,
    quickLinks: [
      {
        name: String,
      },
    ],
    customerCare: [
      {
        phone: String,
        email: String,
      },
    ],

    categories: [String],
    extraFields: [
      {
        label: String,
        value: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Setup", setupSchema);
