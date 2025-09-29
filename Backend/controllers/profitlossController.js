
const Sale = require('../models/Sale');

exports.getProfitLoss = async (req, res) => {
  try {
    const { fromDate, toDate, warehouseId } = req.query;
    const match = {};
    if (fromDate && toDate) {
      match.invoice_date_time={
        $gte:new Date(fromDate),
        $lte:new Date(toDate)
      };
    }
    if (warehouseId) {
      match.warehouse_id=warehouseId;
    }

  
    const salesAgg=await Sale.aggregate([
      {$match:match },
      {
        $group:{
          _id:null,
          totalSales:{$sum:{$toDouble:"$grand_total"}},
          totalDiscount:{$sum:{$toDouble:"$discount_amount"}},
        },
      },
    ]);

    const totalSales = salesAgg[0]?.totalSales || 0;
    const totalDiscount = salesAgg[0]?.totalDiscount || 0;
    const netSales = totalSales-totalDiscount; 
    const cogs = 0;
    const expenses = 0;
    const grossProfit = netSales - cogs;
    const netProfit = grossProfit - expenses;

    res.json({
      netSales,
      cogs,
      grossProfit,
      expenses,
      netProfit,
      details: [
        { category:"Sales Revenue",amount:totalSales,notes:"Total sales before returns"},
        { category:"Net Sales",amount:netSales,notes:"After discounts/returns"},
        { category:"COGS",amount:cogs,notes:"Cost of goods sold"},
        { category:"Expenses",amount:expenses,notes:"Rent, salary, etc."},
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
