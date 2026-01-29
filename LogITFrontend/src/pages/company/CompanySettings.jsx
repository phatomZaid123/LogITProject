import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Bell, Lock, User, Save } from "lucide-react";

function CompanySettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your company account settings.</p>
      </div>

      {/* Company Info */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your company details</CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Tech Corp Solutions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="contact@techcorp.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button variant="primary" className="mt-4">
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Email notifications for student milestones
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Weekly performance summaries
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                System alerts and updates
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage account security</CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <div className="space-y-4">
            <Button variant="outline" fullWidth>
              <Lock size={18} className="mr-2" /> Change Password
            </Button>
            <Button variant="outline" fullWidth>
              <User size={18} className="mr-2" /> Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompanySettings;
