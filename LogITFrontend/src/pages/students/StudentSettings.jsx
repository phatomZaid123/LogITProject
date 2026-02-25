import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LogITLogo from "../../assets/LogITLogo.jpeg";
import StudentProfile from "../../components/Profile.jsx";

function StudentSettings() {
  const { api, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    student_course: "",
    student_admission_number: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(LogITLogo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/auth/users/me");
        const me = response.data?.user || {};
        setForm({
          name: me.name || "",
          email: me.email || "",
          student_course: me.student_course || "",
          student_admission_number: me.student_admission_number || "",
        });
        setProfilePreview(
          me.profile_image
            ? `http://localhost:5000${me.profile_image}`
            : LogITLogo,
        );
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };

    load();
  }, [api]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("student_course", form.student_course);
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      await api.put("/auth/users/me", formData);
      await refreshUser();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View and update your account details.</p>
      </div>

      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Keep your profile information up to date.
          </CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={profilePreview}
                  alt="Profile"
                  className="h-14 w-14 rounded-full border border-gray-200 object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfileImageFile(file);
                    if (file) {
                      setProfilePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-purple-700 hover:file:bg-purple-200"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Default image is LogIT logo until you upload your own photo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={form.student_course}
                  onChange={(e) =>
                    handleChange("student_course", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Course</option>
                  <option value="BSCS">BSCS</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSSE">BSSE</option>
                  <option value="BSDS">BSDS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Number
                </label>
                <input
                  type="text"
                  value={form.student_admission_number}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-600"
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="mt-4"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card elevated>
        <CardContent>
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Account Details
            </h2>

            <StudentProfile selfView profilePreview={profilePreview} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentSettings;
