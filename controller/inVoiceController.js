import generateInvoicePDF from "../helper/generateInvoicePDF.js";
import { getTaxDetails } from "../helper/getTaxDetails.js";
import { Invoice } from "../model/invoice.js";

import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";

export const postInvoice = async (req, res) => {
  try {
    const {
      seller_name,
      seller_address,
      seller_city,
      seller_state,
      seller_pincode,
      seller_panNo,
      seller_gst_reg_no,
      place_of_supply,
      billing_name,
      billing_address,
      billing_city,
      billing_state,
      billing_pincode,
      billing_state_ut_code,
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      shipping_state_ut_code,
      place_of_delivery,
      order_orderNo,
      order_orderDate,
      invoice_no,
      invoice_details,
      invoice_date,
      reverse_charge,
      items,
    } = req.body;
    if (
      !seller_name ||
      !seller_address ||
      !seller_city ||
      !seller_state ||
      !seller_pincode ||
      !seller_panNo ||
      !seller_gst_reg_no ||
      !place_of_supply ||
      !billing_name ||
      !billing_address ||
      !billing_city ||
      !billing_state ||
      !billing_pincode ||
      !billing_state_ut_code ||
      !shipping_name ||
      !shipping_address ||
      !shipping_city ||
      !shipping_state ||
      !shipping_pincode ||
      !shipping_state_ut_code ||
      !place_of_delivery ||
      !order_orderNo ||
      !order_orderDate ||
      !invoice_no ||
      !invoice_details ||
      !invoice_date ||
      !items
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const signature = req.file;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "signature is missing",
      });
    }
    const sign_url = `${process.env.BACKEND_URL}/signature`;
    const signature_url = `${sign_url}/${signature.filename}`;

    const seller = {
      seller_name,
      seller_address,
      seller_city,
      seller_state,
      seller_pincode,
      seller_panNo,
      seller_gst_reg_no,
    };
    const billing = {
      billing_name,
      billing_address,
      billing_city,
      billing_state,
      billing_pincode,
      billing_state_ut_code,
    };

    const order = {
      order_orderNo,
      order_orderDate,
    };
    const invoice = {
      invoice_no,
      invoice_details,
      invoice_date,
    };
    const shipping = {
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      shipping_state_ut_code,
    };

    // const items = [
    //   {
    //     description: "Formal shirt with kurtis design",
    //     unit_price: 3536,
    //     quantity: 1,
    //     discount: 0, // Adjust as needed
    //     tax_rate: 2.5, // Tax rate as a percentage
    //   },
    //   {
    //     description: "Casual jeans",
    //     unit_price: 1200,
    //     quantity: 2,
    //     discount: 100, // Discount in currency
    //     tax_rate: 5, // Tax rate as a percentage
    //   },
    //   {
    //     description: "Leather jacket",
    //     unit_price: 4500,
    //     quantity: 1,
    //     discount: 200,
    //     tax_rate: 10,
    //   },
    //   {
    //     description: "Summer dress",
    //     unit_price: 2500,
    //     quantity: 3,
    //     discount: 150,
    //     tax_rate: 7,
    //   },
    //   {
    //     description: "Running shoes",
    //     unit_price: 1800,
    //     quantity: 1,
    //     discount: 0,
    //     tax_rate: 8,
    //   },
    // ];
    const products = JSON.parse(items);
    const itemDetails = products.map((item) => {
      const { description, unit_price, quantity, discount, tax_rate } = item;

      const netAmount = unit_price * quantity - discount;

      const { taxAmount, taxType } = getTaxDetails(
        place_of_supply,
        place_of_delivery,
        netAmount,
        tax_rate
      );

      const totalAmount = netAmount + taxAmount;

      return {
        description,
        unit_price,
        quantity,
        discount,
        net_amount: netAmount,
        tax_amount: taxAmount,
        taxType,
        tax_rate,
        totalAmount,
      };
    });
    const totalPrice = itemDetails.reduce((a, { totalAmount }) => {
      return a + totalAmount;
    }, 0);

    const totalTax = itemDetails.reduce((a, { tax_amount }) => {
      return a + tax_amount;
    }, 0);
    const amount_in_words = totalPrice.toString();

    const inVoiceInfo = {
      seller,
      place_of_supply,
      billing,
      shipping,
      place_of_delivery,
      order,
      invoice,
      reverse_charge,
      items: itemDetails,
      total_amount: totalPrice,
      amount_in_words,
      signature_url,
      total_Tax: totalTax,
    };
    const fileName = `${invoice_no}_${Date.now()}.jpeg`;
    const filePath = path.join("./public/invoice", fileName);
    await generateInvoicePDF(inVoiceInfo, filePath, req);
    const newInvoice = new Invoice({
      ...inVoiceInfo,
      invoice_url: `${process.env.BACKEND_URL}/invoice/${fileName}`,
    });

    await newInvoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (e) {
    console.log(e);
    res.status(501).json({
      success: false,
      message: "something went wrong",
      error: e.message,
    });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.find({});
    return res.status(200).json({
      success: true,
      message: "invoice get",
      invoice,
    });
  } catch (e) {
    res.status(501).json({
      success: false,
      message: "something went wrong",
      error: e.message,
    });
  }
};
export const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const signUrl = invoice.signature_url.split("/").pop();
    const inVoiceUrl = invoice.invoice_url.split("/").pop();
    const SignPath = path.join(__dirname, "../public/signature", signUrl);
    const inVoicePath = path.join(__dirname, "../public/invoice", inVoiceUrl);
    try {
      fs.unlinkSync(SignPath);
      fs.unlinkSync(inVoicePath);
    } catch (err) {
      console.error("Error deleting image:", err);
      return res.status(501).json({
        success: false,
        message: "something went wrong",
        error: e.message,
      });
    }
    await Invoice.findByIdAndDelete(id);
    res.status(201).json({
      success: true,
      message: "deleted successfully",
    });
  } catch (e) {
    res.status(501).json({
      success: false,
      message: "something went wrong",
      error: e.message,
    });
  }
};
