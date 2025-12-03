const Sale = require('../models/Sale');
const StockLedger = require('../models/Stockledger');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

exports.getProfitLoss = async (req, res) => {
  try {
    const { fromDate, toDate, warehouseId } = req.query;
    const saleMatch = {};
    if (fromDate && toDate) {
      saleMatch.invoice_date_time = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    const sales = await Sale.find(saleMatch).lean();

    let totalSales = 0;
    let totalDiscount = 0;

    for (const sale of sales) {
      totalSales += Number(sale.grand_total || 0);
      totalDiscount += Number(sale.discount_amount || 0);
    }

    const netSales = totalSales - totalDiscount;
    let cogs = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
     
        const stockFilter = {
          productId: new mongoose.Types.ObjectId(item.product_id),
          txnType: "PURCHASE",
          balanceQty: { $gt: 0 },
        };
        if (warehouseId && warehouseId !== '') {
          stockFilter.warehouseId = new mongoose.Types.ObjectId(warehouseId);
        }

        const batches = await StockLedger.find(stockFilter)
          .sort({ txnDate: 1 })
          .lean();

        let qtyToConsume = item.qty;

        for (const batch of batches) {
          if (qtyToConsume <= 0) break;

          const availableQty = batch.balanceQty;
          const consumedQty = Math.min(qtyToConsume, availableQty);
          cogs += consumedQty * batch.rate;
          qtyToConsume -= consumedQty;
        }
      }
    }
    const expenseFilter = {};
    if (fromDate && toDate) {
      expenseFilter.expenseDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    if (warehouseId && warehouseId !== '') {
      expenseFilter.warehouseId = new mongoose.Types.ObjectId(warehouseId);
    }
const expensesList = await Expense.find(expenseFilter).lean();
    const expenses = expensesList.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = netSales - cogs;
    const netProfit = grossProfit - expenses;

    res.json({
      totalSales,
      netSales,
      cogs,
      grossProfit,
      expenses,
      netProfit,
      details: [
        { category: "Sales Revenue", amount: totalSales, notes: "Total sales before discounts" },
        { category: "Net Sales", amount: netSales, notes: "After discounts" },
        { category: "COGS", amount: cogs, notes: "Cost of goods sold" },
        { category: "Expenses", amount: expenses, notes: "Rent, salary, etc." },
      ],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



