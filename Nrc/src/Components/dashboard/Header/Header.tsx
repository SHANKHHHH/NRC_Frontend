import React, { useState } from 'react';
import Tab from '../../Tab/Tab';
import TabList from '../../Tab/TabList';
import { TabProvider } from '../../../context/TabContext';
import CreateNewId from '../../UserProfile/Options/CreateNewId';
import logo from '../../../assets/Login/logo1.png';
import userIcon from '../../../assets/Icons/user.svg';
import UserSidebar from '../../UserProfile/UserSidebar';

const tabItems = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Planner', value: 'planner' },
  { label: 'Production Head', value: 'production' },
  { label: 'Dispatch Head', value: 'dispatch' },
  { label: 'QC Manager', value: 'qc' },
  { label: 'Printing', value: 'printing' },
];

interface HeaderProps {
  tabValue: string;
  setTabValue: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ tabValue, setTabValue }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateId, setShowCreateId] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#fafafa] w-full shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-2">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-15 w-auto" />

        {/* Desktop Tabs */}
        <TabProvider value={tabValue}>
          <div className="hidden sm:flex flex-1 justify-center">
            <TabList value={tabValue} onChange={setTabValue}>
              {tabItems.map(tab => (
                <Tab key={tab.value} label={tab.label} value={tab.value} onChange={() => {}} />
              ))}
            </TabList>
          </div>
        </TabProvider>

        {/* Desktop User Icon */}
        <div className="hidden sm:flex items-center">
          <button
            className="rounded-full bg-gray-200 p-2 hover:cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <img src={userIcon} alt="User" className="h-5 w-5" />
          </button>
        </div>

        {/* Hamburger for mobile */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#fafafa] border-t border-gray-200 shadow-md animate-fade-in-down flex flex-col items-center py-4 gap-2">
          <TabProvider value={tabValue}>
            <TabList
              value={tabValue}
              onChange={value => { setTabValue(value); setMenuOpen(false); }}
              direction="vertical"
            >
              {tabItems.map(tab => (
                <Tab key={tab.value} label={tab.label} value={tab.value} onChange={() => {}} />
              ))}
            </TabList>
          </TabProvider>
          <div className="flex justify-center items-center ">
            <span
              className="text-base font-medium text-gray-700 hover:cursor-pointer px-4 py-2 rounded hover:bg-gray-100 transition"
              onClick={() => {
                setSidebarOpen(true);
                setMenuOpen(false);
              }}
            >
              Profile
            </span>
          </div>
        </div>
      )}

      {/* User Sidebar */}
      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Admin"
        onLogout={() => {/* handle logout */}}
        onOptionSelect={(option) => {
          if (option === "Create new ID") {
            setShowCreateId(true);
            setSidebarOpen(false);
          }
        }}
      />

      {showCreateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-40">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowCreateId(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CreateNewId />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;