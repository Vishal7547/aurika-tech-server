import { timeStamp } from "console";
import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  unit_price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  discount: { type: Number, default: 0, min: 0 },
  net_amount: { type: Number, required: true, min: 0 },
  tax_amount: { type: Number, required: true, min: 0 },
});
const invoiceSchema = new mongoose.Schema(
  {
    seller: {
      seller_name: { type: String, required: true },
      seller_address: { type: String, required: true },
      seller_city: { type: String, required: true },
      seller_state: { type: String, required: true },
      seller_pincode: { type: String, required: true },
      seller_panNo: { type: String, required: true },
      seller_gst_reg_no: { type: String, required: true },
    },
    place_of_supply: { type: String, required: true },
    billing: {
      billing_name: { type: String, required: true },
      billing_address: { type: String, required: true },
      billing_city: { type: String, required: true },
      billing_state: { type: String, required: true },
      billing_pincode: { type: String, required: true },
      billing_state_ut_code: { type: String, required: true },
    },
    shipping: {
      shipping_name: { type: String, required: true },
      shipping_address: { type: String, required: true },
      shipping_city: { type: String, required: true },
      shipping_state: { type: String, required: true },
      shipping_pincode: { type: String, required: true },
      shipping_state_ut_code: { type: String, required: true },
    },
    place_of_delivery: { type: String, required: true },
    order: {
      order_orderNo: { type: String, required: true },
      order_orderDate: { type: Date, required: true },
    },
    invoice: {
      invoice_no: { type: String, required: true },
      invoice_details: { type: String, required: true },
      invoice_date: { type: Date, required: true },
    },
    reverse_charge: { type: Boolean, required: true },
    items: {
      type: [itemSchema],
      validate: [arrayLimit, "Items array cannot be empty"],
    },

    total_amount: { type: Number, required: true, min: 0 },
    total_Tax: { type: Number, required: true },

    amount_in_words: { type: String, required: true },

    signature_url: { type: String, required: true },
    invoice_url: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
  },
  { timeStamp: true }
);

function arrayLimit(val) {
  return val.length > 0;
}
export const Invoice = mongoose.model("Invoice", invoiceSchema);
