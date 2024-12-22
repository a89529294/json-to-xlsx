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
          console.log("Parsed data:", data);
          // Calculate total length first to avoid array resizing
          const totalLength = data.reduce(
            (sum, item) => sum + (item?.data?.list?.length || 0),
            0
          );
          // Pre-allocate array with known size
          const allLists = new Array(totalLength);
          let currentIndex = 0;

          // Fill the array directly without spreading
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

  const convertToXLSX = () => {
    if (!jsonData) {
      alert("Please upload a JSON file first");
      return;
    }

    console.log("Converting data:", jsonData);
    // Create the main workbook
    const workbook = XLSX.utils.book_new();

    // Create the main sheet
    const mainSheetData = jsonData.map((item) => {
      // console.log("Processing item:", item);
      // Only include the specified columns with Chinese names
      return {
        代理商: item.agentAccount,
        使用者名稱: item.memberName,
        帳號: item.account,
        手機號碼: item.phoneNumber,
      };
    });
    // .filter((item) => {
    //   return item.代理商 !== "plg-main";
    // });

    console.log("Sheet data:", mainSheetData);

    // Create the main worksheet
    const mainWorksheet = XLSX.utils.json_to_sheet(mainSheetData);

    // adjustSheetCellWidth(mainWorksheet, mainSheetData);

    // Add the main sheet to workbook
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Main");

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
