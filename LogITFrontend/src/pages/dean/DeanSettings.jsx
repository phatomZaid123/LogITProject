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

function DeanSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account and system settings.
        </p>
      </div>

      {/* Profile Settings */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Dr. Jane Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="jane@university.edu"
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
                Email notifications for new complaints
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Daily summary reports
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
          <CardDescription>Manage your account security</CardDescription>
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

export default DeanSettings;
