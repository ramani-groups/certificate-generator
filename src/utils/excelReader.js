const XLSX = require('xlsx');
const fs = require('fs');

class ExcelReader {
  static readFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      return data;
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  static validateEmployeeData(data, requiredFields) {
    const errors = [];
    const validData = [];

    data.forEach((row, index) => {
      const rowErrors = [];

      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || String(row[field]).trim() === '') {
          rowErrors.push(`Missing or empty field: ${field}`);
        }
      });

      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // +2 because of header and 0-index
          errors: rowErrors
        });
      } else {
        // Normalize data
        const normalizedRow = {
          employeeId: String(row['Employee ID'] || row['employeeId']).trim(),
          name: String(row['Name'] || row['name']).trim(),
          department: String(row['Department'] || row['department']).trim(),
          title: String(row['Title'] || row['title']).trim(),
          awardCategory: String(row['Award Category'] || row['awardCategory'] || '').trim(),
          date: String(row['Date'] || row['date']).trim(),
          ...row // Include all original fields
        };
        validData.push(normalizedRow);
      }
    });

    return {
      valid: validData,
      errors: errors,
      isValid: errors.length === 0,
      totalRows: data.length,
      validRows: validData.length,
      invalidRows: errors.length
    };
  }

  static generateTemplate(data) {
    if (data.length === 0) return null;

    const headers = Object.keys(data[0]);
    return {
      headers: headers,
      sample: data[0],
      totalRows: data.length
    };
  }
}

module.exports = ExcelReader;
