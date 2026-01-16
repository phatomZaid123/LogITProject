import { useState } from "react";
import { Menu, X, LogOut, Shield } from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

// Add { children } prop here
function SideBar({ children, setCreateBatch, setCreateStudent }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [selectedCar, setSelectedCar] = useState("volvo");
  const { logout } = useAuth();

  const options = [
    { value: "ford", label: "Ford" },
    { value: "volvo", label: "Volvo" },
    { value: "fiat", label: "Fiat" },
  ];

  // Default value

  const handleChange = (event) => {
    setSelectedCar(event.target.value);
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-1 z-50 p-1 bg-purple-600 text-white rounded-md lg:hidden"
        onClick={() => setOpenSidebar(!openSidebar)}
      >
        {openSidebar ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for Mobile */}
      {openSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`rounded-2xl fixed top-0 left-0 z-40 h-screen w-60 bg-purple-700 text-white transition-transform duration-300 ease-in-out
          ${openSidebar ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:sticky`}
      >
        <div className="flex flex-col h-full p-3 ">
          <div className="bg-purple-900 font-bold flex flex-col items-center justify-center py-4 rounded-3xl mb-6">
            <div className="text-center text-lg">Dean Dashboard</div>
            <Shield size={60} className="my-2" />
            <div className="text-2xl text-center">CSC</div>
          </div>
          <select value={selectedCar} onChange={handleChange}>
            {options.map((option) => (
              // Use a unique key for each option when mapping
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Buttons to trigger the forms */}
          <Button
            variant="outline"
            className="mt-2 text-white"
            size="sm"
            onClick={() => setCreateBatch(true)}
          >
            Create Batch
          </Button>
          <Button
            variant="outline"
            className="mt-2 text-white"
            size="sm"
            onClick={() => setCreateStudent(true)}
          >
            Create Student
          </Button>
          <Button onClick={logout} variant="danger" className="mt-40">
            <LogOut size={25} />
            <span className="ml-2"> Logout </span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 w-full lg:pt-2">{children}</main>
    </div>
  );
}

export default SideBar;
