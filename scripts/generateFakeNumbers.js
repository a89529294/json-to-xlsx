import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFakeNumbersFile() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, '../customer_data_prd1.xlsx'));
    
    const worksheet = workbook.getWorksheet('工作表1');
    const phoneNumbers = [];
    
    worksheet.eachRow((row, rowNumber) => {
        const phoneNumber = row.getCell(4).value;
        if (phoneNumber) {
            phoneNumbers.push(String(phoneNumber));
        }
    });

    const fileContent = `// Auto-generated from customer_data_prd1.xlsx
export const fakePhoneNumbers = ${JSON.stringify(phoneNumbers, null, 2)};
`;

    fs.writeFileSync(
        path.join(__dirname, '../src/fakePhoneNumbers.js'),
        fileContent
    );
}

generateFakeNumbersFile().catch(console.error);
