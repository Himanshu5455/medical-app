import React, { useState } from "react";
import { User, Lock, Users, LogOut } from "lucide-react";
import ChangePassword from "./ChangePassword";
import UserManagement from "./UserManagement";

const userData = {
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  firstName: "User",
  lastName: "Name",
  role: "Admin",
  email: "emailuser@email.com",
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState(userData);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setUser({ ...user, ...form });
  };

  const handleCancel = () => {
    setForm({ firstName: user.firstName, lastName: user.lastName });
  };

  return (
    <div className="p-8 min-h-screen max-w-[1140px] mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 border border-gray-300 rounded-xl">
          <div className="bg-white rounded-xl shadow p-6">
            {/* Avatar */}
            <div className="relative flex flex-col items-center mb-6">
              <span className="absolute right-0 -top-[6px] bg-red-100 text-red-500 text-xs px-2 py-0.5 rounded">
                {user.role}
              </span>
              <div className="relative w-24 h-24 mb-3">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              <div className="font-semibold">{user.firstName + " " + user.lastName}</div>
              <div className="text-sm text-gray-500 mt-1">{user.role}</div>
            </div>

            {/* Menu */}
            <ul className="mt-2 space-y-1">
              <li
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${
                  activeTab === "account"
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User size={18} /> <span>My account</span>
              </li>
              <li
                onClick={() => setActiveTab("password")}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${
                  activeTab === "password"
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Lock size={18} /> <span>Change password</span>
              </li>
              <li
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${
                  activeTab === "users"
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users size={18} /> <span>User management</span>
              </li>
              <li className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer text-red-600 hover:bg-red-50">
                <LogOut size={18} /> <span>Log out</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {activeTab === "account" && (
            <div className="bg-white rounded-xl shadow p-6 border border-gray-300">
              <div className="font mb-4 border-b border-gray-300 pb-2">
                Personal Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-xs mb-3">First Name</div>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-3">Last Name</div>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-3">Role</div>
                  <p className="text-sm text-gray-700">{user.role}</p>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-3">Email Address</div>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="bg-gray-100 text-gray-700 px-5 py-2 rounded hover:bg-gray-200 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="bg-teal-700 text-white px-5 py-2 rounded hover:bg-teal-800 transition"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {activeTab === "password" && <ChangePassword />}

          {activeTab === "users" && <UserManagement/>}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

