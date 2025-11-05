
    import { IoPrintSharp } from "react-icons/io5";
    import { PiExportBold } from "react-icons/pi"; 
    import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
    const ExportButtons = ({ onExcel, onPdf, onPrint }) => {
    return (
        <div className="my-4 d-flex justify-content-start gap-2">
        <button className="btn btn-success" onClick={onExcel}><span className="me-1 mb-4" ><PiMicrosoftExcelLogoFill /></span>Export Excel</button>
        <button className="btn btn-danger" onClick={onPdf}><span className="text-dark me-1"><PiExportBold /></span>Export PDF</button>
        <button className="btn btn-info" onClick={onPrint}> <span><IoPrintSharp /></span>Print</button>
        </div>
    );
    };

    export default ExportButtons;