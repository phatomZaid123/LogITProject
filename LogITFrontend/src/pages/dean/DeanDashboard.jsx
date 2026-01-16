import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { CardContent } from "../../components/ui/Card";
import { ModalForm } from "../../components/ui/Modal";
import StudentList from "../../components/StudentList";
import { useState, useEffect } from "react";

function DeanDashboard() {
  const [createStudent, setCreateStudent] = useState(false);
  const [createBatch, setCreateBatch] = useState(false);

  useEffect(()=>{},[])

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
        >
          <div className="flex-1 justify-center gap-10 lg:gap-50">
            {/* Forms rendered as modals */}
            {createBatch && (
              <ModalForm
                onClose={() => setCreateBatch(false)}
                title="Create Batch"
              />
            )}
            {createStudent && (
              <ModalForm
                onClose={() => setCreateStudent(false)}
                title="Create Student"
              />
            )}
            <div className="px-4 py-2 mb-2 inline-block center bg-blue-100 text-blue-800 rounded-lg text-xs">
              <h3 className="text-xl">Registration Links</h3>

              <span>For Student: </span>
              <br />
              <span>For Company:</span>
            </div>
          </div>

          <StudentList />
        </SideBar>
      </CardContent>
    </>
  );
}

export default DeanDashboard;
