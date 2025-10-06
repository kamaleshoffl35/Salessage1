
// const Sale = require('../models/Sale');

// exports.getProfitLoss = async (req, res) => {
//   try {
//     const { fromDate, toDate, warehouseId } = req.query;
//     const match = {};
//     if (fromDate && toDate) {
//       match.invoice_date_time={
//         $gte:new Date(fromDate),
//         $lte:new Date(toDate)
//       };
//     }
//     if (warehouseId) {
//       match.warehouse_id=warehouseId;
//     }

  
//     const salesAgg=await Sale.aggregate([
//       {$match:match },
//       {
//         $group:{
//           _id:null,
//           totalSales:{$sum:{$toDouble:"$grand_total"}},
//           totalDiscount:{$sum:{$toDouble:"$discount_amount"}},
//         },
//       },
//     ]);

//     const totalSales = salesAgg[0]?.totalSales || 0;
//     const totalDiscount = salesAgg[0]?.totalDiscount || 0;
//     const netSales = totalSales-totalDiscount; 
//     const cogs = 0;
//     const expenses = 0;
//     const grossProfit = netSales - cogs;
//     const netProfit = grossProfit - expenses;

//     res.json({
//       netSales,
//       cogs,
//       grossProfit,
//       expenses,
//       netProfit,
//       details: [
//         { category:"Sales Revenue",amount:totalSales,notes:"Total sales before returns"},
//         { category:"Net Sales",amount:netSales,notes:"After discounts/returns"},
//         { category:"COGS",amount:cogs,notes:"Cost of goods sold"},
//         { category:"Expenses",amount:expenses,notes:"Rent, salary, etc."},
//       ]
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


// const Sale = require('../models/Sale');
// const StockLedger = require('../models/Stockledger');
// const mongoose = require('mongoose');

// exports.getProfitLoss = async (req, res) => {
//   try {
//     const { fromDate, toDate, warehouseId } = req.query;

//     // 1️⃣ Filter for sales invoices
//     const match = {};
//     if (fromDate && toDate) {
//       match.invoice_date_time = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate)
//       };
//     }
//     if (warehouseId) {
//       match.warehouse_id = mongoose.Types.ObjectId(warehouseId);
//     }

//     // 2️⃣ Aggregate totals
//     const salesAgg = await Sale.aggregate([
//       { $match: match },
//       {
//         $group: {
//           _id: null,
//           totalSales: { $sum: { $toDouble: "$grand_total" } },
//           totalDiscount: { $sum: { $toDouble: "$discount_amount" } },
//         },
//       },
//     ]);

//     const totalSales = salesAgg[0]?.totalSales || 0;
//     const totalDiscount = salesAgg[0]?.totalDiscount || 0;
//     const netSales = totalSales - totalDiscount;

//     // 3️⃣ Fetch all invoices
//     const salesItems = await Sale.find(match).lean();

//     // 4️⃣ FIFO COGS
//     let cogs = 0;

//     for (const sale of salesItems) {
//       for (const item of sale.items) {
//         let qtyToConsume = item.qty;

//         // Find purchase batches for this product
//         const purchaseBatches = await Stockledger.find({
//           productId: new mongoose.Types.ObjectId(item.productId),
//           ...(warehouseId
//             ? { warehouseId: new mongoose.Types.ObjectId(warehouseId) }
//             : {}), // optional filter
//           txnType: "PURCHASE",
//           balanceQty: { $gt: 0 }
//         })
//           .sort({ txnDate: 1 }) // FIFO
//           .lean();

//         for (const batch of purchaseBatches) {
//           if (qtyToConsume <= 0) break;

//           const availableQty = batch.balanceQty;
//           const consumedQty = Math.min(qtyToConsume, availableQty);
//           cogs += consumedQty * batch.rate;

//           qtyToConsume -= consumedQty;

//           // Optionally update balanceQty:
//           // await StockLedger.updateOne(
//           //   { _id: batch._id },
//           //   { $inc: { balanceQty: -consumedQty } }
//           // );
//         }
//       }
//     }

//     // 5️⃣ Profit
//     const expenses = 0; // add if needed
//     const grossProfit = netSales - cogs;
//     const netProfit = grossProfit - expenses;

//     // 6️⃣ Response
//     res.json({
//       netSales,
//       cogs,
//       grossProfit,
//       expenses,
//       netProfit,
//       details: [
//         { category: "Sales Revenue", amount: totalSales, notes: "Total sales before returns" },
//         { category: "Net Sales", amount: netSales, notes: "After discounts/returns" },
//         { category: "COGS", amount: cogs, notes: "Cost of goods sold" },
//         { category: "Expenses", amount: expenses, notes: "Rent, salary, etc." },
//       ]
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

const Sale = require('../models/Sale');
const StockLedger = require('../models/Stockledger');
const mongoose = require('mongoose');

exports.getProfitLoss = async (req, res) => {
  try {
    const { fromDate, toDate, warehouseId } = req.query;

    const match = {};
    if (fromDate && toDate) {
      match.invoice_date_time = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }
    // Only filter by warehouseId if Sale has that field:
    // if (warehouseId && warehouseId !== '') {
    //   match.warehouse_id = new mongoose.Types.ObjectId(warehouseId);
    // }

    const salesAgg = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $toDouble: "$grand_total" } },
          totalDiscount: { $sum: { $toDouble: "$discount_amount" } },
        },
      },
    ]);

    const totalSales = salesAgg[0]?.totalSales || 0;
    const totalDiscount = salesAgg[0]?.totalDiscount || 0;
    const netSales = totalSales - totalDiscount;

    const salesItems = await Sale.find(match).lean();

    let cogs = 0;

    for (const sale of salesItems) {
      for (const item of sale.items) {
        let qtyToConsume = item.qty;

        const stockFilter = {
          productId: new mongoose.Types.ObjectId(item.product_id), // fixed field
          txnType: "PURCHASE",
          balanceQty: { $gt: 0 }
        };
        if (warehouseId && warehouseId !== '') {
          stockFilter.warehouseId = new mongoose.Types.ObjectId(warehouseId);
        }

        const purchaseBatches = await StockLedger.find(stockFilter)
          .sort({ txnDate: 1 }) // FIFO
          .lean();

        for (const batch of purchaseBatches) {
          if (qtyToConsume <= 0) break;

          const availableQty = batch.balanceQty;
          const consumedQty = Math.min(qtyToConsume, availableQty);
          cogs += consumedQty * batch.rate;

          qtyToConsume -= consumedQty;

          // optional: update balanceQty live
          // await StockLedger.updateOne(
          //   { _id: batch._id },
          //   { $inc: { balanceQty: -consumedQty } }
          // );
        }
      }
    }

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
        { category: "Sales Revenue", amount: totalSales, notes: "Total sales before returns" },
        { category: "Net Sales", amount: netSales, notes: "After discounts/returns" },
        { category: "COGS", amount: cogs, notes: "Cost of goods sold" },
        { category: "Expenses", amount: expenses, notes: "Rent, salary, etc." },
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
