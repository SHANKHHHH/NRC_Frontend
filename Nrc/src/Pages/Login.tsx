import { useState } from "react";
import axios from "axios";
import Logo from "../assets/Login/logo.jpg"

interface LoginFormData {
  phone: string;
  password: string;
  role: string;
}

export default function Login() {
  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    phone: "",
    password: "",
    role: ""
  });

  // Loading and submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  // Role dropdown options
  const roles = ["Admin", "Planner", "Production Head", "Dispatch Executive", "QC Manager"]; // Extend as needed

  /**
   * Handle input and select changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Destructure fields
    const { phone, password, role } = formData;

    try {
      // Check for empty fields
      if (!phone || !password || !role) {
        throw new Error("Please fill in all fields");
      }

      // Replace this URL with your backend login endpoint
      const API_ENDPOINT = `${import.meta.env.VITE_API_URL}/auth/login`;

      // Send data to backend
      const response = await axios.post(API_ENDPOINT, {
        phone,
        password,
        role
      });

      if (response.status === 200) {
        setSubmitStatus("success");
        setFormData({ phone: "", password: "", role: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Logo Image Placeholder */}
          <div className="flex justify-center mb-6">
            <img
              src={Logo}
              alt="NR Containers"
              className="h-30 w-auto"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-[#00AEEF]">Login</h2>

            {/* Phone Input */}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            {/* Password Input */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            {/* Role Dropdown */}
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer"
                required
              >
                <option value="" disabled>Select Role</option>
                {roles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>

              {/* Down arrow icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00AEEF] hover:bg-[#00AEEF] text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center hover:cursor-pointer"
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Login
            </button>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                Login successful!
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                Login failed. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
