import { useState } from "react";
import axios from "axios";
import Logo from "../assets/Login/logo.jpg";

/**
 * Type for form data used in login
 */
interface LoginFormData {
  userId: string;
  password: string;
}

/**
 * Login Component
 */
export default function Login() {
  // ---------------------- State Declarations ---------------------- //
  const [formData, setFormData] = useState<LoginFormData>({
    userId: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  // ---------------------- Handlers ---------------------- //

  /**
   * Handle input changes
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "userId") {
      setUserIdError(null); // Clear error on change
    }
  };

  /**
   * Handle form submission
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { userId, password } = formData;

    // Simple frontend validation
    if (!userId.trim() || !password.trim()) {
      setUserIdError("User ID is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // API endpoint (secured via environment variable)
      const API_ENDPOINT = `${import.meta.env.VITE_API_URL}/auth/login`;

      // Make POST request to backend
      const response = await axios.post(API_ENDPOINT, { userId, password });

      // If login successful
      if (response.status === 200) {
        setSubmitStatus("success");
        setFormData({ userId: "", password: "" }); // Clear form
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      // Reset status message after 3s
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  // ---------------------- JSX ---------------------- //

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={Logo} alt="NR Containers" className="h-20 w-auto" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-[#00AEEF]">Login</h2>

            {/* User ID Input */}
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="User ID"
              className={`w-full px-4 py-3 rounded-lg border ${userIdError ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#00AEEF]`}
              required
              maxLength={20}
            />
            {userIdError && (
              <div className="text-red-600 text-sm mb-2">{userIdError}</div>
            )}

            {/* Password Input */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              required
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              )}
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm"
                role="alert"
              >
                Login successful!
              </div>
            )}

            {submitStatus === "error" && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
                role="alert"
              >
                Login failed. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
