const cartSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });