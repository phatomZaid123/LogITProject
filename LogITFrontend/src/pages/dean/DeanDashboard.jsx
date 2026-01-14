import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { CardContent } from "../../components/ui/Card";
import { ModalForm } from "../../components/ui/Modal";
import StudentList from "../../components/StudentList";
import { useState } from "react";

function DeanDashboard() {
  const [createStudent, setCreateStudent] = useState(false);
  const [createBatch, setCreateBatch] = useState(false);
  const [batches, setBatches] = useState([]);

  // This function 'receives' the data from the child
  const handleNewBatch = (dataFromServer) => {
    console.log("Parent received:", dataFromServer);
    setBatches((prev) => [...prev, dataFromServer]); // Update your UI list
    console.log(batches);
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
        <div className="px-2 py-1 inline-block center bg-blue-100 text-blue-800 rounded-lg text-xs">
          <h3 className="text-xl">Registration Links</h3>

          <span>For Student:{batches.season_name} </span>
          <br />
          <span>For Company:</span>
        </div>
        <SideBar
          setCreateBatch={setCreateBatch}
          setCreateStudent={setCreateStudent}
        >
          <div className="flex-1 justify-center gap-10 lg:gap-50">
            {/* Forms rendered as modals */}
            {createBatch && (
              <ModalForm
                onClose={() => setCreateBatch(false)}
                title="Create Batch"
                onSuccess={handleNewBatch}
              />
            )}
            {createStudent && (
              <ModalForm
                onClose={() => setCreateStudent(false)}
                title="Create Student"
              />
            )}
          </div>

          <StudentList />
        </SideBar>
      </CardContent>
    </>
  );
}

export default DeanDashboard;
