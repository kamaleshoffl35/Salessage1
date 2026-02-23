import * as XLSX from "xlsx";

const ImportExcelButton = ({ onImport }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) 
      return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      onImport(jsonData); 
    };
    reader.readAsArrayBuffer(file);
  };

  return (
   <label className="btn add text-white d-flex align-items-center mb-3">
      Import Excel
      <input
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFileUpload}
      />
    </label>
  );
};

export default ImportExcelButton;
