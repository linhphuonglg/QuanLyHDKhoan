/**
 * Tiện ích chuyển đổi số tiền thành chữ tiếng Việt chuẩn quy phạm văn bản pháp lý
 */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroupOfThree(group: string, showZeroHundred: boolean): string {
  const [a, b, c] = group.split('').map(Number);
  let res = '';

  if (a !== 0 || showZeroHundred) {
    res += `${DIGITS[a]} trăm `;
  }

  if (b === 0) {
    if (c !== 0 && (a !== 0 || showZeroHundred)) {
      res += 'lẻ ';
    }
  } else if (b === 1) {
    res += 'mười ';
  } else {
    res += `${DIGITS[b]} mươi `;
  }

  if (b === 0) {
    if (c !== 0) {
      res += `${DIGITS[c]} `;
    }
  } else if (b === 1) {
    if (c === 1) {
      res += 'một ';
    } else if (c === 5) {
      res += 'lăm ';
    } else if (c !== 0) {
      res += `${DIGITS[c]} `;
    }
  } else {
    if (c === 1) {
      res += 'mốt ';
    } else if (c === 4) {
      res += 'tư ';
    } else if (c === 5) {
      res += 'lăm ';
    } else if (c !== 0) {
      res += `${DIGITS[c]} `;
    }
  }

  return res;
}

export function numberToVietnameseWords(amount: number): string {
  if (amount === 0) return 'Không đồng chẵn';
  if (!amount || isNaN(amount)) return 'Không đồng';

  const absAmount = Math.floor(Math.abs(amount));
  let str = absAmount.toString();
  
  // Pad with leading zeros to make length multiple of 3
  while (str.length % 3 !== 0) {
    str = '0' + str;
  }

  const groups: string[] = [];
  for (let i = 0; i < str.length; i += 3) {
    groups.push(str.substring(i, i + 3));
  }

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  let result = '';
  const totalGroups = groups.length;

  for (let i = 0; i < totalGroups; i++) {
    const groupVal = parseInt(groups[i], 10);
    if (groupVal > 0) {
      const showZeroHundred = i > 0;
      const groupText = readGroupOfThree(groups[i], showZeroHundred);
      const unitIndex = totalGroups - 1 - i;
      result += `${groupText}${units[unitIndex]} `;
    }
  }

  result = result.trim().replace(/\s+/g, ' ');
  if (!result) return 'Không đồng';

  // Capitalize first character
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return `${result} đồng chẵn`;
}

export function formatVND(amount: number): string {
  if (typeof amount !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  if (typeof amount !== 'number') return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
}
