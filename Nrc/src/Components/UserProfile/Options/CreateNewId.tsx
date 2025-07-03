import React, { useState } from "react";


const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Planner", value: "planner" },
  { label: "Production Head", value: "production head" },
  { label: "QC Manager", value: "qc manager" },
  { label: "Dispatch Executive", value: "dispatch executive" },
  { label: "Printing", value: "printing" },
];

const CreateNewId: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with your backend endpoint
      // await fetch("/api/create-user", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // Optionally handle success/failure here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-6xl 2xl:max-w-6xl mx-auto mt-8 bg-white rounded-lg shadow-2xl p-8">
      <h2 className="text-center text-lg font-semibold mb-6">
        Create New Login ID
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">User Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] hover:cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Employee Phone No.
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] hover:cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Employee's Email ID
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] hover:cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Set Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] hover:cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#00AEEF] hover:cursor-pointer"
            required
          >
            <option value="" disabled>
              Select Role
            </option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-[#00AEEF] text-white py-2 rounded font-semibold text-base mt-2 hover:bg-[#0099cc] transition hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create ID"}
        </button>
      </form>
    </div>
  );
};

export default CreateNewId;
