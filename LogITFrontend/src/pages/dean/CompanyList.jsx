import { useState, useEffect } from "react";
import CompanyListComponent from "../../components/CompanyList";
import { useAuth } from "../../context/AuthContext";

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { api, user } = useAuth();
  console.log(api);
  console.log(user);

  // Fetch registered companies from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all students from backend
        const companyDetails = await api.get("/dean/getAllCompany");
        console.log("Students response from backend:", companyDetails.data);

        // API returns {companies: [...] }
        const companyList = companyDetails.data?.company || [];
        setCompanies(companyList);
        console.log("Students", companyList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      <CompanyListComponent companies={companies} loading={loading} />
    </div>
  );
}

export default CompanyList;
