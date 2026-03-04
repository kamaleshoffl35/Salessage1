const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productDetails: {
    title: String,
    image: String,
    category: String,
  },
  selectedSize: {
    dimension: String,
    originalPrice: Number,
    salePrice: Number,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
};

module.exports = mongoose.model("Cart", cartSchema);