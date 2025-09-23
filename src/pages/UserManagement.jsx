import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

const mockUsers = [
    { id: 1, name: "User name", email: "email.user@gmail.com", role: "Not set", status: "Active" },
    { id: 2, name: "User name", email: "email.user@gmail.com", role: "Physician", status: "Active" },
    { id: 3, name: "User name", email: "email.user@gmail.com", role: "Role", status: "Inactive" },
];

const UserManagement = () => {
    const [users, setUsers] = useState(mockUsers);
    const [search, setSearch] = useState("");
    const [openUserId, setOpenUserId] = useState(null);

    const toggleStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    const handleToggle = (userId) => {
        if (openUserId === userId) {
            setOpenUserId(null); // close if already open
        } else {
            setOpenUserId(userId); // open for this user
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-300">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800 transition">
                    + Add user
                </button>
            </div>

            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="text-left border-b border-gray-200">
                        <th className="px-3 py-2">Member</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-gray-500 text-sm">{user.email}</span>
                            </td>
                            <td className="px-3 py-2">{user.role}</td>
                            <td className="px-3 py-2">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${user.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-3 py-2 relative">
                                <div className="flex items-center gap-2">
                                    <MoreVertical
                                        size={18}
                                        onClick={() => handleToggle(user.id)}
                                        className="cursor-pointer"
                                    />
    
                                    {openUserId === user.id && (
                                        <div className="absolute top-8 right-6 mt-2 w-36 bg-white shadow-lg rounded-lg z-10 border border-gray-200">
                                            <div className="flex flex-col jutify-between gap-2 p-2">
                                                <button
                                                    onClick={() => {
                                                        toggleStatus(user.id);
                                                        setOpenUserId(null); // close after action
                                                    }}
                                                    className={`text-sm mb-1 ${user.status === "Active" ? "text-red-600" : "text-green-600"
                                                        } hover:underline text-left`}
                                                >
                                                    {user.status === "Active" ? "Deactivate" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // handle edit action
                                                        setOpenUserId(null);
                                                    }}
                                                    className="text-sm text-gray-700 hover:underline text-left"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination (static example) */}
            <div className="flex justify-end items-center mt-4 gap-2 text-gray-500 text-sm">
                <button className="px-2 py-1 border rounded">{"<<"}</button>
                <span>Page 1 of 14</span>
                <button className="px-2 py-1 border rounded">{">>"}</button>
            </div>
        </div>
    );
};

export default UserManagement;
