import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Login/logo.jpg"; // Assuming this is the correct path to your logo
import LoadingSpinner from "../Components/common/LoadingSpinner";
import { Eye, EyeOff } from "lucide-react";

/**
 * Type for form data used in login
 */
interface LoginFormData {
  id: string;
  password: string;
  role: string; // For UI display only
}

/**
 * Props for Login component
 */
interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
  setUserRole: (role: string | null) => void;
}

/**
 * Login Component
 */
export default function Login({ setIsAuthenticated, setUserRole }: LoginProps) {
  const navigate = useNavigate();

  // ---------------------- State Declarations ---------------------- //
  const [formData, setFormData] = useState<LoginFormData>({
    id: "",
    password: "",
    role: "planner", // Changed default to 'planner' for easier testing of the new feature
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------- Handlers ---------------------- //

  /**
   * Handle input changes
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { id, password } = formData;

    try {
      // Simple frontend validation
      if (!id.trim() || !password.trim()) {
        throw new Error("All fields are required.");
      }

      // API endpoint
      const API_ENDPOINT = "https://nrprod.nrcontainers.com/api/auth/login";

      // Make POST request to backend with the expected payload format
      const response = await axios.post(API_ENDPOINT, { id, password });

      // If login successful
      if (response.data.success) {
        setSubmitStatus("success");
        
        // Log the response for debugging
        console.log('Login response:', response.data);

        // Store the access token in localStorage
        // IMPORTANT: Using 'acessToken' as per your backend response.
        localStorage.setItem("accessToken", response.data.acessToken); // Changed to acessToken

        // Store user data in localStorage for persistence
        localStorage.setItem("userData", JSON.stringify(response.data.data));

        // Get user data from response
        const userData = response.data.data;

        // Set authentication state and user role
        setIsAuthenticated(true);
        
        // Handle roles array from backend response
        if (userData.roles && userData.roles.length > 0) {
          setUserRole(userData.roles[0]); // Get first role from array
          console.log('User role set to:', userData.roles[0]);
        } else {
          console.error('No roles found in user data:', userData);
          setUserRole(null);
        }

        // Clear form
        setFormData({ id: "", password: "", role: "planner" }); // Reset role to planner for consistency

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus(null), 3000);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
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

            {/* ID Input */}
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="Employee ID"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              required
            />

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Role Selection Dropdown (for UI only) */}
            {/* <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
            >
              <option value="admin">Admin</option>
              <option value="printing_manager">Printing Manager</option>
              <option value="dispatch_executive">Dispatch Executive</option>
              <option value="production_head">Production Head</option>
              <option value="planner">Planner</option>
              Add more roles as needed
            </select> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center hover:cursor-pointer"
            >
              {isSubmitting && <LoadingSpinner size="sm" variant="button" color="white" text="" />}
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Temporary Login Button for Testing - IMPORTANT: Uses your provided valid token */}
            {/* <button
              type="button"
              onClick={() => {
                // Simulate successful login with test data using correct payload structure
                const testUserData = {
                  id: formData.role === "admin" ? "NRC001" : "NRC002",
                  userActive: true,
                  roles: [formData.role] // Use the ACTUAL selected role from form
                };

                // Store test data in localStorage with the correct key 'accessToken'
                localStorage.setItem("accessToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ik5SQzAwMSIsImlhdCI6MTc1NTk0NjI4MiwiZXhwIjoxNzU4NTM4MjgyfQ.x96Yh3gBmDv1tcKxXBGQK2tAExAwMfuYyVvqZsg2Q3s");
                localStorage.setItem("userData", JSON.stringify(testUserData));

                setIsAuthenticated(true);
                
                // Use the ACTUAL selected role, not the backend response
                setUserRole(formData.role); // This will use "planner" when you select planner
                console.log('Test login - User role set to:', formData.role);
                
                navigate('/dashboard');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 hover:cursor-pointer"
            >
              Test Login as {formData.role
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
              }
            </button> */}

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
