import React, { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { getUsers, deleteUser } from "../services/api";
import AddUserPopup from "./AddUserPopup";
import EditUser from "./EditUser";
import Deactivate from "./Deactivate";



const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openUserId, setOpenUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeaModalOpen, setIsDeaModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
    const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = (newUser) => {
    // newUser is already mapped to table shape by API layer
    setUsers((prev) => [newUser, ...prev]);
  };
  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (userId) => {
    setOpenUserId(openUserId === userId ? null : userId);
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const handleUpdateUser = async (updatedUserFromApi) => {
    // Map backend response to table shape
    const mapped = {
      id: updatedUserFromApi.id,
      name: `${updatedUserFromApi.first_name || ''} ${updatedUserFromApi.last_name || ''}`.trim(),
      email: updatedUserFromApi.username,
      role: updatedUserFromApi.role,
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === mapped.id
          ? { ...u, ...mapped }
          : u
      )
    );

 
    try {
      const fresh = await getUsers();
      setUsers(fresh);
    } catch (e) {
     
    }
  };

  const handleDeactivate = async (userId) => {
    setIsDeactivating(true);
    try {
   
      await deleteUser(userId);
      // remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error('Failed to deactivate user', e);
      // optionally show a message to the user
      // eslint-disable-next-line no-alert
      alert('Failed to deactivate user. See console for details.');
    } finally {
      setIsDeactivating(false);
      setIsDeaModalOpen(false);
      setSelectedUser(null);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-1/3"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#125A67] text-white px-4 py-2 rounded hover:bg-teal-800 transition w-full md:w-auto"
        >
          + Add user
        </button>

        <AddUserPopup
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddUser}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse min-w-[600px] md:min-w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Role</th>
              {/* <th className="px-3 py-2">Status</th> */}
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="flex flex-row items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10">
                    <img
                      src={user.image || "https://placehold.co/96x96?text=User"}
                      alt=""
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-gray-500 text-sm">{user.email}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{user.role}</td>
                {/* <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${user.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {user.status}
                  </span>
                </td> */}
                <td className="px-3 py-2 relative">
                  <div className="flex items-center gap-2">
                    <MoreVertical
                      size={18}
                      onClick={() => handleToggle(user.id)}
                      className="cursor-pointer"
                    />
                    {openUserId === user.id && (
                      <div className="absolute top-8 right-6 mt-2 w-36 bg-white shadow-lg rounded-lg z-10 border border-gray-200">
                        <div className="flex flex-col gap-2 p-2">
                          <button className="text-sm text-gray-700 hover:underline text-left"
                            onClick={() => {
                              // pick this user and open the deactivate confirmation modal
                              setSelectedUser(user);
                              setIsDeaModalOpen(true);
                              setOpenUserId(null); // close dropdown
                            }}
                            // onClick={() => {
                            //   toggleStatus(user.id);
                            //   setOpenUserId(null);
                            // }}
                            // className={`text-sm mb-1 ${user.status === "Active"
                            //   ? "text-red-600"
                            //   : "text-green-600"
                            //   } hover:underline text-left`}
                          >
                            {/* {user.status === "Active" ? "Deactivate" : "Activate"} */}
                            Deactivate
                          </button>
                          <button
                            onClick={() => {
                              setOpenUserId(null);        // close dropdown
                              setSelectedUser(user);      // pick user
                              setIsEditModalOpen(true);   // open modal
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
        <EditUser
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />
        <Deactivate
          isOpen={isDeaModalOpen}
          isLoading={isDeactivating}
          onClose={() => {
            // if a deactivation is in progress, block closing
            if (isDeactivating) return;
            setIsDeaModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={() => selectedUser && handleDeactivate(selectedUser.id)}
        />
      </div>

      <div className="flex justify-end items-center mt-4 gap-2 text-gray-500 text-sm">
        <button className="px-2 py-1 border rounded">{"<<"}</button>
        <span>Page 1 of 14</span>
        <button className="px-2 py-1 border rounded">{">>"}</button>
      </div>
    </div>

  );
};

export default UserManagement;
