import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
// import categoryReducer from "./categorySlice";
// import unitReducer from "./unitSlice"
import taxReducer from "./taxSlice";
import customerReducer from "./customerSlice";
import supplierReducer from "./supplierSlice";
import warehouseReducer from "./warehouseSlice";
import purchaseReducer from "./purchaseSlice";
import saleReducer from "./saleSlice";
import customerPaymentReducer from "./customerpaymentSlice";
import supplierPaymentReducer from "./supplierpaymentSlice";
import stockledgerReducer from "./stockledgerSlice";
import expenseReducer from "./expenseSlice";
import salesReturnReducer from "./salesReturnSlice";

import salereportReducer from "./salereportSlice";
import purchasereportReducer from "./purchasereportSlice";

import salereturnreportReducer from "./salereturnreportSlice";
import gstreportReducer from "./gstreportSlice";
import profitlossReducer from "./profitlossSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    // categories: categoryReducer,
    // units:unitReducer,
    taxes: taxReducer,
    customers: customerReducer,
    suppliers: supplierReducer,
    warehouses: warehouseReducer,
    purchases: purchaseReducer,
    sales: saleReducer,
    cus_payments: customerPaymentReducer,
    sup_payments: supplierPaymentReducer,
    stockss: stockledgerReducer,
    salesReturn: salesReturnReducer,
    salereports: salereportReducer,
    purchasereports: purchasereportReducer,
    salereturnreports: salereturnreportReducer,
    gstreports: gstreportReducer,
    expenses: expenseReducer,
    profitloss: profitlossReducer,
  },
});
