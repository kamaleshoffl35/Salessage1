const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
// const unitRoutes=require("./routes/unitRoutes")
const taxRoutes=require("./routes/taxRoutes")
const customerRoutes=require("./routes/customerRoutes")
const supplierRoutes=require("./routes/supplierRoutes")
const warehouseRoutes=require("./routes/warehouseRoutes")
const purchaseRoutes=require("./routes/purchaseRoutes")
const saleposRoutes=require("./routes/saleposRoutes")
const customerpaymentRoutes=require('./routes/customerpaymentRoutes')
const supplierpaymentRoutes=require("./routes/supplierpaymentRoutes")
const stockadjustmentRoutes=require("./routes/stockadjRoutes")
const stockledgerRoutes=require("./routes/stockledgerRoutes")
const expenseRoutes=require("./routes/expenseRoutes")
const reportRoutes=require("./routes/reportRoutes")
const userRoutes=require('./routes/userRoutes')
const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://127.0.0.1:27017/inventory")
mongoose.connect("mongodb+srv://jasim2003ahamed_db_user:dt82x9fit2XoqpaO@cluster0.tuvatzp.mongodb.net/")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
// app.use("/api/units",unitRoutes)
app.use("/api/taxes",taxRoutes)
app.use("/api/customers",customerRoutes)
app.use("/api/suppliers",supplierRoutes)
app.use("/api/warehouses",warehouseRoutes)
app.use("/api/purchases",purchaseRoutes)
app.use("/api/sales",saleposRoutes)
app.use("/api/cus_payments",customerpaymentRoutes)
app.use("/api/sup_payments",supplierpaymentRoutes)
app.use("/api/stocks",stockadjustmentRoutes)
app.use("/api/stockledger",stockledgerRoutes)
app.use("/api/expenses",expenseRoutes)
app.use("/api/reports", reportRoutes);
app.use("/api/users",userRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
