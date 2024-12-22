import { useState } from "react";
import ExcelJS from "exceljs";
import "./App.css";

function App() {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log("Parsed data:", data);
          const totalLength = data.reduce(
            (sum, item) => sum + (item?.data?.list?.length || 0),
            0
          );
          const allLists = new Array(totalLength);
          let currentIndex = 0;

          for (const item of data) {
            const list = item?.data?.list;
            if (list && list.length > 0) {
              for (const entry of list) {
                allLists[currentIndex++] = entry;
              }
            }
          }

          console.log("Combined list data length:", allLists.length);
          setJsonData(allLists);
          event.target.value = null;
        } catch (error) {
          alert("Error parsing JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const convertToXLSX = async () => {
    if (!jsonData) {
      alert("Please upload a JSON file first");
      return;
    }

    console.log("Converting data:", jsonData);
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Main');

    // Define columns
    worksheet.columns = [
      { header: '代理商', key: 'agentAccount', width: 15 },
      { header: '使用者名稱', key: 'memberName', width: 15 },
      { header: '帳號', key: 'account', width: 15 },
      { header: '手機號碼', key: 'phoneNumber', width: 15 }
    ];

    // Add rows and apply conditional formatting
    jsonData.forEach((item) => {
      const row = worksheet.addRow({
        agentAccount: item.agentAccount,
        memberName: item.memberName,
        account: item.account,
        phoneNumber: item.phoneNumber
      });

      // Check if phone number is fake (doesn't start with 886)
      const phoneNumber = String(item.phoneNumber);
      if (!phoneNumber.startsWith('886')) {
        // Apply light red background to all cells in the row
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE0E0' } // Light red color
          };
        });
      }
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    try {
      // Generate the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customer_data.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      setJsonData(null);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file');
    }
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
