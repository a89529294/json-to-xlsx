export function adjustSheetCellWidth(sheet, data) {
  // Calculate column widths
  const columnWidths = {};
  const headerRow = Object.keys(data[0]);

  // Initialize with header lengths
  headerRow.forEach((header) => {
    columnWidths[header] = header.length;

    if (header === "paymentGateways") {
      console.log(columnWidths[header]);
    }
  });

  // Check data lengths
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const value = String(row[key] || "");

      let length = 0;

      for (let i = 0; i < value.length; i++) {
        if (isChineseChar(value[i])) {
          length += 2;
        } else length++;
      }

      columnWidths[key] = Math.max(columnWidths[key], length);
    });
  });

  // Set column widths (add a little padding)
  sheet["!cols"] = headerRow.map((header) => ({
    wch: Math.min(columnWidths[header] + 2, 100), // Cap width at 100 characters
  }));
}

const isChineseChar = (char) => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Unified Ideographs Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Unified Ideographs Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Unified Ideographs Extension D
    (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Unified Ideographs Extension E
    (code >= 0x2ceb0 && code <= 0x2ebef) // CJK Unified Ideographs Extension F
  );
};
