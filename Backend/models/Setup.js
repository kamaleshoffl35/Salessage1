const mongoose = require("mongoose");

const setupSchema = new mongoose.Schema(
  {
    // 🏢 COMPANY
    title: { type: String, required: true },
    tagline: String,
    description: String,
    logo: String,

    // 📞 CONTACT
    phone: String,
    email: String,
    address: String,

    // 🌐 SOCIAL MEDIA
    socialLinks: {
      instagram: String,
      whatsapp: String,
      facebook: String,
    },

    // 🦶 FOOTER
    footerDescription: String,
    footerCardImage: String,

    // 🔗 QUICK LINKS
    quickLinks: [
      {
        name: String,
        url: String,
      },
    ],

    // 👩‍💼 CUSTOMER CARE
    customerCare: {
      phone: String,
      email: String,
    },

    // 🛒 CATEGORIES
    categories: [String],

    // ➕ EXTRA
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
  { timestamps: true }
);

module.exports = mongoose.model("Setup", setupSchema);