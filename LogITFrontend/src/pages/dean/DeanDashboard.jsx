import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { CardContent } from "../../components/ui/Card";
import { ModalForm } from "../../components/ui/Modal";
import StudentList from "../../components/StudentList";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import Button from "../../components/ui/Button";

function DeanDashboard() {
  const [createStudent, setCreateStudent] = useState(false);
  const [createBatch, setCreateBatch] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [activeBatchLinks, setActiveBatchLinks] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [showInviteLinks, setShowInviteLinks] = useState(false);
  const { api } = useAuth();

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/dean/getAllBatch");
        setBatches(res.data);
        // Get the active batch links
        const activeBatch = res.data.find((batch) => batch.isActive);
        if (activeBatch) {
          setActiveBatchLinks({
            batchName: activeBatch.session_name,
            studentLink: activeBatch.student_invite_link,
            companyLink: activeBatch.company_invite_link,
          });
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };
    fetchBatches();
  }, []);

  const handleBatchCreated = (batchData) => {
    setActiveBatchLinks(batchData);
    // Refresh batches list
    api.get("/dean/getAllBatch").then((res) => {
      setBatches(res.data);
    });
  };

  const copyToClipboard = (link, linkType) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(linkType);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <>
      <CardContent>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="h-100 w-100 rounded-full overflow-hidden 
                 bg-[url('/LogITLogo.png')] bg-contain bg-no-repeat bg-center 
                 opacity-30  blur-xs"
          ></div>
        </div>
        <Header />

        <SideBar
          setCreateBatch={setCreateBatch}
          setCreateStudent={setCreateStudent}
          batches={batches}
          selectedBatchId={selectedBatchId}
          setSelectedBatchId={setSelectedBatchId}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        >
          <div className="flex-1 flex flex-col gap-6">
            {/* Modals */}
            <div>
              {createBatch && (
                <ModalForm
                  batches={batches}
                  onClose={() => setCreateBatch(false)}
                  onBatchCreated={handleBatchCreated}
                  title="Create Batch"
                />
              )}
              {createStudent && (
                <ModalForm
                  batches={batches}
                  onClose={() => setCreateStudent(false)}
                  title="Create Student"
                />
              )}
            </div>
            <div className="flex flex-col gap-6">
              <Button
                variant="outline"
                onClick={() => setShowInviteLinks(!showInviteLinks)}
                className="w-fit self-end"
              >
                {showInviteLinks ? "Hide" : "Show"} Invitation Links
              </Button>
            </div>

            {/* Invitation Links Card */}
           {showInviteLinks && activeBatchLinks && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
                <h2 className="text-lg font-bold text-purple-800 mb-4">
                  📋 Invitation Links - {activeBatchLinks.batchName}
                </h2>

                <div className="space-y-4">
                  {/* Student Registration Link */}
                  <div className="text-sm bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      👨‍🎓 Student Registration Link
                    </h3>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-300">
                      <input
                        type="text"
                        value={activeBatchLinks.studentLink}
                        readOnly
                        className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(
                            activeBatchLinks.studentLink,
                            "student",
                          )
                        }
                        className="p-2 hover:bg-blue-100 rounded transition-colors"
                        title="Copy link"
                      >
                        {copiedLink === "student" ? (
                          <Check size={20} className="text-green-600" />
                        ) : (
                          <Copy size={20} className="text-blue-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Share this link with students for registration
                    </p>
                  </div>

                  {/* Company Registration Link */}
                  <div className="text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">
                      🏢 Company Registration Link
                    </h3>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-green-300">
                      <input
                        type="text"
                        value={activeBatchLinks.companyLink}
                        readOnly
                        className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(
                            activeBatchLinks.companyLink,
                            "company",
                          )
                        }
                        className="p-2 hover:bg-green-100 rounded transition-colors"
                        title="Copy link"
                      >
                        {copiedLink === "company" ? (
                          <Check size={20} className="text-green-600" />
                        ) : (
                          <Copy size={20} className="text-green-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Share this link with companies for registration
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Student List */}
            <StudentList
              selectedBatchId={selectedBatchId}
              selectedCourse={selectedCourse}
            />
          
          </div>
        </SideBar>
      </CardContent>
    </>
  );
}

export default DeanDashboard;
