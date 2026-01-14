import { CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import {
  Search,
  UserCircleIcon,
  FileArchiveIcon,
  Building2Icon,
  MailWarning,
} from "lucide-react";
import SideBar from "./SideBar";

function Header() {
  return (
    <>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center justify-between bg-purple-800 p-2 gap-2 rounded-xl">
          <ul className="flex w-full md:w-auto justify-between md:justify-end items-center gap-6 bg-purple-600 text-white text-sm p-2 rounded-md">
            {/* Centered User Icon and Text */}
            <li className="flex flex-col items-center cursor-pointer hover:text-purple-800 transition">
              <UserCircleIcon size={25} />
              <span>All Students</span>
            </li>

            {/* Centered Company Icon and Text */}
            <li className="flex flex-col items-center cursor-pointer hover:text-purple-800 transition">
              <Building2Icon size={25} />
              <span>All Company</span>
            </li>
            <li className="flex flex-col items-center cursor-pointer hover:text-purple-800 transition">
              <FileArchiveIcon size={25} />
              <span>Student Report</span>
            </li>
            <li className="flex flex-col items-center cursor-pointer hover:text-purple-800 transition">
              <MailWarning size={25} />
              <span>Company Complains</span>
            </li>
          </ul>
          <div className="w-full md:max-w-md">
            <form className="relative flex items-center w-full h-10 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-gray-200">
              <div className="grid place-items-center h-full w-12 text-gray-300">
                <Search size={20} strokeWidth={2.5} />
              </div>

              <input
                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                type="text"
                id="search"
                placeholder="Search something..."
              />

              {/* Added explicit classes to Button to ensure it fits well */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="h-full px-4 font-medium"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </CardHeader>
    </>
  );
}

export default Header;
