

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportButtons = ({ data = [], columns = [], title = "Report" }) => {
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 14, 10);

    const tableColumn = columns.map((col) => col.header);
    const tableRows = data.map((row) =>
      columns.map((col) =>
        col.render ? col.render(row) : row[col.key] ?? ""
      )
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save(`${title}.pdf`);
  };


  const exportExcel = () => {
    const worksheetData = data.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col.header] = col.render
          ? col.render(row)
          : row[col.key] ?? "";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);

    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const printTable = () => {
    window.print();
  };

  return (
    <div className="d-flex gap-2 mb-3">
      <button className="btn btn-dark" onClick={exportExcel}>
        Export Excel
      </button>
      <button className="btn btn-dark" onClick={exportPDF}>
        Export PDF
      </button>
      <button className="btn btn-dark" onClick={printTable}>
        Print
      </button>
    </div>
  );
};

export default ExportButtons;
