import React from 'react';
import './invoice.css';
import Logo from '../assets/myntra.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';

const Invoice = ({ invoiceData }) => {
  const { t } = useTranslation();

  // Format currency to 2 decimal places
  const formatCurrency = (amount) => amount.toFixed(2);
  const totalAmount = formatCurrency(invoiceData.totalAmount);

  // Convert number to words
  const numberToWords = (number) => {
    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const thousands = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"];

    if (number === 0) return "zero";

    let words = [];
    let numStr = String(number);

    // Split into whole and fractional parts
    let [wholePart, fractionalPart = ""] = numStr.split(".");

    // Convert whole part to words
    if (wholePart !== "0") {
      wholePart = wholePart.split("").reverse().join("");
      let groups = [];

      for (let i = 0; i < wholePart.length; i += 3) {
        groups.push(wholePart.substr(i, 3).split("").reverse().join(""));
      }

      for (let i = 0; i < groups.length; i++) {
        let group = parseInt(groups[i]);

        if (group === 0) continue;

        let groupWords = [];
        let hundredsDigit = Math.floor(group / 100);

        if (hundredsDigit > 0) {
          groupWords.push(ones[hundredsDigit], "hundred");
        }

        let remainder = group % 100;

        if (remainder < 10) {
          groupWords.push(ones[remainder]);
        } else if (remainder < 20) {
          groupWords.push(teens[remainder - 10]);
        } else {
          let tensDigit = Math.floor(remainder / 10);
          let onesDigit = remainder % 10;
          groupWords.push(tens[tensDigit]);
          if (onesDigit > 0) {
            groupWords.push(ones[onesDigit]);
          }
        }

        if (groupWords.length > 0 && i > 0) {
          groupWords.push(thousands[i]);
        }

        words = groupWords.concat(words);
      }
    }

    // Convert fractional part to words
    if (fractionalPart) {
      words.push("point");
      for (let digit of fractionalPart) {
        words.push(ones[parseInt(digit)]);
      }
    }

    return words.join(" ");
  };

  // Handle PDF download
  const handleDownload = async () => {

  
    const invoiceElement = document.getElementById('invoice');
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: true,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('invoice.pdf');
  };

  return (
    <div className='main-container' >
    <div className="invoice-wrapper" id="invoice">
      <div className="header-section">
        <img src={Logo} alt="Company Logo" className="company-logo" />
        <div className="invoice-Title">
          <h3>{t('Tax Invoice/Bill of Supply/Cash Memo')}</h3>
          <p>{t('Original for Recipient')}</p>
        </div>
      </div>

      <div className="Details">
        <div className="sold-by">
          <h3 style={{ marginRight: '100px' }}>{t('Sold By')}:</h3>
          {invoiceData.sellerDetails && (
            <>
              <div style={{ marginRight: '100px', marginTop: '-20px' }}>{invoiceData.sellerDetails.name}</div>
              <div>{invoiceData.sellerDetails.address}</div>
              <div>{invoiceData.sellerDetails.city}, {invoiceData.sellerDetails.state}, {invoiceData.sellerDetails.pincode}</div>
              <div style={{ marginRight: '100px' }}><b>PAN No:</b> {invoiceData.sellerDetails.panNo}</div>
              <div style={{ marginRight: '25px' }}><b>GST Registration No:</b> {invoiceData.sellerDetails.gstNo}</div>
            </>
          )}

          <div className='order-details'>
            <div><b>Order Number:</b> {invoiceData.orderDetails?.orderNo}</div>
            <div><b>Order Date:</b> {invoiceData.orderDetails?.orderDate}</div>
          </div>
        </div>

        <div className="address-section">
          <div className="billing-address">
            <h3>{t('Billing Address')}:</h3>
            {invoiceData.billingDetails && (
              <>
                <div>{invoiceData.billingDetails.name}</div>
                <div>{invoiceData.billingDetails.address}</div>
                <div>{invoiceData.billingDetails.city}, {invoiceData.billingDetails.state}, {invoiceData.billingDetails.pincode}</div>
                <div><b>State/UT Code:</b> {invoiceData.billingDetails.stateCode}</div>
              </>
            )}
          </div>

          <div className="shipping-address">
            <h3>{t('Shipping Address')}:</h3>
            {invoiceData.shippingDetails && (
              <>
                <div>{invoiceData.shippingDetails.name}</div>
                <div>{invoiceData.shippingDetails.address}</div>
                <div>{invoiceData.shippingDetails.city}, {invoiceData.shippingDetails.state}, {invoiceData.shippingDetails.pincode}</div>
                <div><b>State/UT Code:</b> {invoiceData.shippingDetails.stateCode}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="place-and-invoice-detail">
        <div>
          <b>Place of Supply:</b> {invoiceData.placeOfSupply} <br />
          <b>Place of Delivery:</b> {invoiceData.placeOfDelivery}<br />
        
          <b>Invoice No:</b> {invoiceData.invoiceDetails?.invoiceNo}<br />
          <b>Invoice Details:</b> {invoiceData.invoiceDetails?.invoiceDetails}<br />
          <b>Invoice Date:</b> {invoiceData.invoiceDetails?.invoiceDate}
         </div>
      </div>

      <div className="table-heading">
        <table>
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th>Net Amount</th>
              <th>Tax Rate</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>IGST</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{item.unitPrice}</td>
                <td>{item.quantity}</td>
                <td>{item.netAmount}</td>
                <td>2.5%</td>
                <td>{item.taxAmount.CGST.toFixed(2)}</td>
                <td>{item.taxAmount.SGST.toFixed(2)}</td>
                <td>{item.taxAmount.IGSTtoFixed(2)}</td>
                <td>{item.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="Totals-Amount">
        <div>{t('TOTAL')}: ₹{totalAmount}</div> {/* Format total amount here */}
        <div>{t('Total Amount in Words')}: {numberToWords(totalAmount)}</div> {/* Display total amount in words */}
      </div>

      <div className="signature-section">
        <div className="signature">
          For {invoiceData.sellerDetails?.name} <br />
          {t('Authorized Signatory')}
          <br />
          <img src={URL.createObjectURL(invoiceData.signature)} alt="Signature" className="signature-img" />
        </div>
      </div>

      <div className='reverse-charge'>
        {t('Whether tax is payable under reverse charge')}: {invoiceData.reverseCharge ? 'Yes' : 'No'}
      </div>

      
    </div>
    <div className="download-options">
        <button onClick={handleDownload} className="download-button">Download</button>
      </div>
      </div>
  );
};

export default Invoice;
