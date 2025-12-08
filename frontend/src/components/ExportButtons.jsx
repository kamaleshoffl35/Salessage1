 const ExportButtons = ({ onExcel, onPdf, onPrint }) => {
    return (
        <div className="my-4 d-flex justify-content-start gap-2">
    <button className="btn text-white" style={{backgroundColor:"#182235"}} onClick={onExcel}>Export Excel</button>
        <button className="btn text-white" style={{backgroundColor:"#182235"}} onClick={onPdf}>Export PDF</button>
        <button className="btn text-white" style={{backgroundColor:"#182235"}} onClick={onPrint}>Print</button>
        </div>
    );
    };

    export default ExportButtons;