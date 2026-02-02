const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
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
const app = express();
const cookieParser = require("cookie-parser");
const importGoogleTaxonomyIfEmpty = require("./utils/importGoogleTaxonomy");

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://salessage.vyoobam.com"
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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));   // ✅ THIS IS ENOUGH

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://salessage.vyoobam.com"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true
//   })
// );
// app.options("*", cors({
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       "http://localhost:5173",
//       "https://salessage.vyoobam.com"
//     ];

//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));


app.use(express.json());
// mongoose.connect("mongodb://127.0.0.1:27017/inventory")
mongoose.connect(process.env.MONGO_URI) 
.then(async () => {
    console.log("MongoDB connected");

    await importGoogleTaxonomyIfEmpty(); })
.catch(err => console.log(err));
app.use("/api/products", productRoutes);
// app.use("/api/categories", categoryRoutes);
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
app.use("/api/google-categories", require("./routes/googleCategory"));


const __dirname1 = path.resolve();
app.use(express.static(path.join(__dirname1, "/frontend/dist"))); 

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname1, "/frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

