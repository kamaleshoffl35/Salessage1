require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const unitRoutes = require("./routes/unitRoutes");

const taxRoutes = require("./routes/taxRoutes");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleposRoutes = require("./routes/saleposRoutes");
const salereturnRoutes = require("./routes/salereturnRoutes")
const customerpaymentRoutes = require("./routes/customerpaymentRoutes");
const supplierpaymentRoutes = require("./routes/supplierpaymentRoutes");
// const stockadjustmentRoutes = require("./routes/stockadjRoutes");
const stockledgerRoutes = require("./routes/stockledgerRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());
// const allowedOrigins = [
//   "https://salessage.vyoobam.com",
//   "http://localhost:5173",

//   // Allow Chakkarapani frontend
//   "https://chakkarapani.com",
//   "http://localhost:3000",
//   "http://localhost:5173"
// ];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// };
// app.use(cors(corsOptions)); 
const allowedOrigins = [
  "https://salessage.vyoobam.com",
  "https://chakkarapani.com",
  "https://chakrapani.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-tenant-id"
  ],
  exposedHeaders: ["x-tenant-id"]
};

app.use(cors(corsOptions));


app.use(express.json());
// mongoose.connect("mongodb://127.0.0.1:27017/inventory")
mongoose.connect(process.env.MONGO_URI) 
.then(async () => {
    console.log("MongoDB connected");
 })
.catch(err => console.log(err));
app.use("/api/products", productRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleposRoutes);
app.use("/api/sales-returns",salereturnRoutes)
app.use("/api/cus_payments", customerpaymentRoutes);
app.use("/api/sup_payments", supplierpaymentRoutes);
// app.use("/api/stocks", stockadjustmentRoutes);
app.use("/api/stockledger", stockledgerRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/orders", require("./routes/getOrdersRoutes"));
app.use("/api/admin", require("./routes/adminOrderRoutes"));
app.use("/api/reviews", reviewRoutes);
app.get("/test-public", (req, res) => {
  res.json({ message: "SERVER UPDATED" });
});

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  const __dirname1 = path.resolve();

  app.use(express.static(path.join(__dirname1, "frontend", "dist")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname1, "frontend", "dist", "index.html"));
  });
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

