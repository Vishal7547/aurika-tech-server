export const getTaxDetails = (
  placeOfSupply,
  placeOfDelivery,
  netAmount,
  taxRate
) => {
  let taxAmount = 0;
  let taxType = "IGST";

  if (placeOfSupply === placeOfDelivery) {
    taxType = "CGST & SGST";
    taxAmount = (netAmount * taxRate) / 100;
  } else {
    taxAmount = (netAmount * taxRate) / 100;
  }

  return { taxAmount, taxType };
};
