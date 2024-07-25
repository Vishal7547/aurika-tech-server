import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateInvoicePDF = async (inVoiceInfo, filePath, req) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const templatePath = path.join(
    __dirname,
    "../public/views/invoiceTemplate.html"
  );
  const template = fs.readFileSync(templatePath, "utf-8");

  const itemRows = inVoiceInfo.items
    .map(
      (item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.description}</td>
      <td>${item.unit_price}</td>
      <td>${item.quantity}</td>
       <td>${item.net_amount}</td>
      <td>${item.tax_rate}</td>
      <td>${item.taxType}</td>
      <td>${item.tax_amount}</td>
      <td>${item.totalAmount}</td>

     
    </tr>
  `
    )
    .join("");

  const html = template
    .replace("{{seller_name}}", inVoiceInfo?.seller?.seller_name)
    .replace("{{seller_address}}", inVoiceInfo?.seller?.seller_address)
    .replace("{{seller_city}}", inVoiceInfo?.seller?.seller_city)
    .replace("{{seller_state}}", inVoiceInfo?.seller?.seller_state)
    .replace("{{seller_pincode}}", inVoiceInfo?.seller?.seller_pincode)
    .replace("{{seller_gst_reg_no}}", inVoiceInfo?.seller?.seller_gst_reg_no)
    .replace("{{seller_panNo}}", inVoiceInfo?.seller?.seller_panNo)

    .replace("{{billing_name}}", inVoiceInfo?.billing?.billing_name)
    .replace("{{billing_address}}", inVoiceInfo?.billing?.billing_address)
    .replace("{{billing_city}}", inVoiceInfo?.billing?.billing_city)
    .replace("{{billing_state}}", inVoiceInfo?.billing?.billing_state)
    .replace("{{billing_pincode}}", inVoiceInfo?.billing?.billing_pincode)
    .replace(
      "{{billing_state_ut_code}}",
      inVoiceInfo?.billing?.billing_state_ut_code
    )
    .replace("{{itemRows}}", itemRows)
    .replace("{{shipping_name}}", inVoiceInfo?.shipping?.shipping_name)
    .replace("{{shipping_address}}", inVoiceInfo?.shipping?.shipping_address)
    .replace("{{shipping_state}}", inVoiceInfo?.shipping?.shipping_state)
    .replace("{{shipping_pincode}}", inVoiceInfo?.shipping?.shipping_pincode)
    .replace("{{shipping_city}}", inVoiceInfo?.shipping?.shipping_city)
    .replace(
      "{{shipping_state_ut_code}}",
      inVoiceInfo?.shipping?.shipping_state_ut_code
    )

    .replace("{{order_orderNo}}", inVoiceInfo?.order?.order_orderNo)
    .replace("{{order_orderDate}}", inVoiceInfo?.order?.order_orderDate)

    .replace("{{invoice_no}}", inVoiceInfo?.invoice?.invoice_no)
    .replace("{{invoice_details}}", inVoiceInfo?.invoice?.invoice_details)
    .replace("{{invoice_date}}", inVoiceInfo?.invoice?.invoice_date)

    .replace("{{total_amount}}", inVoiceInfo?.total_amount)
    .replace("{{total_Tax}}", inVoiceInfo?.total_Tax)

    .replace("{{reverse_charge}}", inVoiceInfo?.reverse_charge ? "Yes" : "No")
    .replace("{{amount_in_words}}", inVoiceInfo?.amount_in_words)
    .replace("{{signature_url}}", inVoiceInfo?.signature_url)

    .replace("{{place_of_supply}}", inVoiceInfo?.place_of_supply)

    .replace("{{place_of_delivery}}", inVoiceInfo?.place_of_delivery);

  await page.setContent(html, { waitUntil: "networkidle0" });
  const contentHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });
  await page.setViewport({ width: 1280, height: contentHeight });

  await page.screenshot({
    path: filePath,
    fullPage: true,
    type: "jpeg",
    quality: 90,
  });
  //   await page.pdf({
  //     path: "tech.pdf",
  //     margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
  //     printBackground: true,
  //     format: "A4",
  //   });
  await browser.close();
};

export default generateInvoicePDF;
