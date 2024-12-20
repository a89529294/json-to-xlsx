import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";
import { adjustSheetCellWidth } from "./utils";

function App() {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setJsonData(Array.isArray(data) ? data : [data]);
          event.target.value = null;
        } catch (error) {
          alert("Error parsing JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const convertToXLSX = () => {
    if (!jsonData) {
      alert("Please upload a JSON file first");
      return;
    }

    // Create the main workbook
    const workbook = XLSX.utils.book_new();

    // Create the main sheet
    const mainSheetData = jsonData.map((item, index) => {
      // Start with a flat copy of the item
      const flatItem = {};
      
      // Process each field
      Object.entries(item).forEach(([key, value]) => {
        if (key === 'banks' && value && value.length > 0) {
          // Handle banks specially as before
          flatItem[key] = {
            f: `=HYPERLINK("#'Banks_${index + 1}'!A1","Click to view ${value.length} bank(s)")`,
          };
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects by creating separate columns for each property
          Object.entries(value).forEach(([subKey, subValue]) => {
            flatItem[`${key}.${subKey}`] = subValue;
          });
        } else if (Array.isArray(value)) {
          // Handle arrays
          if (value.length === 0) {
            flatItem[key] = '';
          } else if (typeof value[0] === 'object') {
            // Array of objects - stringify each object and join
            flatItem[key] = value.map(item => JSON.stringify(item)).join(', ');
          } else {
            // Array of primitives - just join with commas
            flatItem[key] = value.join(', ');
          }
        } else {
          // Handle primitive values as is
          flatItem[key] = value;
        }
      });
      
      return flatItem;
    });

    // Create the main worksheet
    const mainWorksheet = XLSX.utils.json_to_sheet(mainSheetData);

    adjustSheetCellWidth(mainWorksheet, mainSheetData);

    // Add the main sheet to workbook
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Main");

    // Create individual bank sheets
    jsonData.forEach((customer, index) => {
      if (customer.banks && customer.banks.length > 0) {
        // Add header row with back link
        const bankData = customer.banks;

        const bankSheet = XLSX.utils.aoa_to_sheet([
          Object.keys(customer.banks[0]), // Headers
          ...customer.banks.map((bank) => Object.values(bank)), // Data rows
        ]);

        // Add back link at the top
        bankSheet["A1"] = {
          f: '=HYPERLINK("#Main!A1","← Back to Main")',
        };

        // Adjust column widths
        adjustSheetCellWidth(bankSheet, bankData);

        XLSX.utils.book_append_sheet(workbook, bankSheet, `Banks_${index + 1}`);
      }
    });

    // Write the file
    XLSX.writeFile(workbook, "customer_data.xlsx");
    setJsonData(null);
  };

  return (
    <div className="container">
      <div className="button-container">
        <label className="upload-btn-wrapper">
          <div className="btn">Upload JSON</div>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
          />
        </label>
        <button className="btn" onClick={convertToXLSX} disabled={!jsonData}>
          Download XLSX
        </button>
      </div>
    </div>
  );
}

export default App;
