import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import categoryReducer from "./categorySlice"
import unitReducer from "./unitSlice"
import taxReducer from "./taxSlice"
import customerReducer from "./customerSlice"
import supplierReducer from "./supplierSlice"
import warehouseReducer from "./warehouseSlice"
import purchaseReducer from "./purchaseSlice"
import saleReducer from "./saleSlice"
import customerPaymentReducer from "./customerpaymentSlice"
import supplierPaymentReducer from "./supplierpaymentSlice"
import stockadjReducer from "./stockadjSlice"

export const store = configureStore({
  reducer: {
    products: productReducer,
    categories: categoryReducer,
    units:unitReducer,
    taxes:taxReducer,
    customers:customerReducer,
    suppliers:supplierReducer,
    warehouses:warehouseReducer,
    purchases:purchaseReducer,
    sales:saleReducer,
    cus_payments:customerPaymentReducer,
    sup_payments:supplierPaymentReducer,
    stocks:stockadjReducer,
  },
});
