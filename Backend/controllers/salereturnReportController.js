const SalesReturn = require("../models/SalesReturn");


exports.getSaleReturnReports = async (req, res) => {
  try {
    const {from_date, to_date}=req.query
     if (!from_date || !to_date) {
      return res.status(400).json({ message: "From date & To date required" });
    }
    const purchases = await SalesReturn.find({
         invoice_date_time: {
           $gte: new Date(from_date + "T00:00:00"),
           $lte: new Date(to_date + "T23:59:59"),
         },
       })
         .populate("customer_id", "name phone")
         .populate("items.product_id", "name")
           .sort({ invoice_date_time: -1 });
   
       res.status(200).json(purchases);
     } catch (err) {
       console.error("Purchase report error:", err);
       res.status(500).json({ error: err.message });
     }
};

