import { useState, useRef } from "react";
import Button from "./ui/Button";
import { Download, Copy, Check, QrCode, X } from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const QRCodeModal = ({
  onClose,
  qrData,
  title = "Student Registration QR Code",
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrData.registrationLink);
      setCopied(true);
      toast.success("Registration link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
      console.error("Copy failed:", error);
    }
  };

  const handleSaveToLocalStorage = () => {
    try {
      const storageData = {
        batchName: qrData.batchName,
        batchYear: qrData.batchYear,
        registrationLink: qrData.registrationLink,
        qrCode: qrData.qrCode,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "studentRegistrationQR",
        JSON.stringify(storageData),
      );
      toast.success("QR Code saved to local storage!");
    } catch (error) {
      toast.error("Failed to save to local storage");
      console.error("LocalStorage save failed:", error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      // Get the QR code container element
      const element = qrRef.current;

      // Convert the element to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions to center the content
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (210 - imgWidth) / 2; // A4 width is 210mm
      const y = 20;

      // Add the canvas image to PDF
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        x,
        y,
        imgWidth,
        imgHeight,
      );

      // Save the PDF
      const fileType = title.toLowerCase().includes("company")
        ? "Company"
        : "Student";
      pdf.save(
        `${fileType}_Registration_QR_${qrData.batchName}_${qrData.batchYear}.pdf`,
      );
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
      console.error("PDF download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = () => {
    try {
      const link = document.createElement("a");
      link.href = qrData.qrCode;
      const fileType = title.toLowerCase().includes("company")
        ? "Company"
        : "Student";
      link.download = `${fileType}_Registration_QR_${qrData.batchName}_${qrData.batchYear}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
      console.error("Image download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <QrCode className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {qrData.batchName} - {qrData.batchYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* QR Code Display */}
        <div
          ref={qrRef}
          className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl p-8 mb-6"
        >
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
              <img src={qrData.qrCode} alt={title} className="w-64 h-64" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Scan to Register
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {title.toLowerCase().includes("company")
                  ? "Companies can scan this QR code to register"
                  : "Students can scan this QR code to register for OJT"}
              </p>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs font-mono text-gray-600 break-all">
                  {qrData.registrationLink}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            How to use
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-7">
            <li>
              • Share this QR code with{" "}
              {title.toLowerCase().includes("company")
                ? "companies"
                : "students"}{" "}
              to register
            </li>
            <li>• Download as PDF for printing and distribution</li>
            <li>• Download as image to share digitally</li>
            <li>• Save to local storage for quick access later</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={18} />
                Download as PDF
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadImage}
            className="flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Image
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleSaveToLocalStorage}
            className="flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save to Storage
          </Button>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
