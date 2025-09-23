import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd) => {
    // Check at least one number and one symbol
    const numberRegex = /\d/;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return numberRegex.test(pwd) && symbolRegex.test(pwd);
  };

  const handleChangePassword = () => {
    if (!validatePassword(password)) {
      setError("Utilize at least one number (1, 2...) and one symbol (!, @...)");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    // Call API or handle password change here
    alert("Password changed successfully!");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-300">
      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
      <div className="space-y-4">
        <div className="relative">
      <input
  type={showPassword ? "text" : "password"}
  placeholder="New Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
  autoComplete="new-password" // helps with some browsers
/>
                 <span
            className="absolute right-3 top-2.5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <div className="relative">
        <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            autoComplete="new-password"
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
        
        <button
          onClick={handleChangePassword}
          className="bg-teal-700 text-white px-5 py-2 rounded hover:bg-teal-800 transition"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
