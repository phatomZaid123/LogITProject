function TopBar() {
  return (
    <main className="text-sm m-1 p-1 flex flex-row justify-center gap-10  lg:gap-50 lg:p-4 lg:text-md text-center text-white">
      <div className="bg-purple-800 p-2 rounded-lg">
        <label className="flex">Total Student</label>
        <span className="">0</span>
      </div>
      <div className="bg-purple-800 p-2 rounded-lg">
        <label className="flex ">Total Company</label>
        <span>3</span>
      </div>
    </main>
  );
}

export default TopBar;
