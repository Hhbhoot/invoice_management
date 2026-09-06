export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Only';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numString = amount.toFixed(2);
  const [rupeesStr, paiseStr] = numString.split('.');
  
  let rupees = parseInt(rupeesStr, 10);
  const paise = parseInt(paiseStr, 10);

  if (rupees === 0 && paise === 0) return 'Zero Only';

  const convertToWords = (num: number): string => {
    if (num === 0) return '';
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : ' ');
    if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred ' + (num % 100 !== 0 ? convertToWords(num % 100) : '');
    
    // Using Indian Numbering System
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + 'Thousand ' + (num % 1000 !== 0 ? convertToWords(num % 1000) : '');
    if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + 'Lakh ' + (num % 100000 !== 0 ? convertToWords(num % 100000) : '');
    return convertToWords(Math.floor(num / 10000000)) + 'Crore ' + (num % 10000000 !== 0 ? convertToWords(num % 10000000) : '');
  };

  let words = 'Rupees ' + convertToWords(rupees).trim();
  if (paise > 0) {
    if (rupees === 0) {
      words = convertToWords(paise).trim() + ' Paise';
    } else {
      words += ' and ' + convertToWords(paise).trim() + ' Paise';
    }
  }

  return words + ' Only';
}
