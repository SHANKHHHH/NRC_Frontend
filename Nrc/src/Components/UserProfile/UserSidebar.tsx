import React, { useState } from 'react';
import userIcon from '../../assets/Icons/user.svg';
import settingsIcon from '../../assets/Icons/settings.svg';

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
  onLogout: () => void;
  onOptionSelect?: (option: string) => void;
}

const menuOptions = [
  'Dashboard',
  'Notifications',
  'Create new ID',
  'Manage Access',
  'Planner',
  'Printing Manager',
  'Production Head',
  'Dispatch Executive',
  'QC Manager',
];

const accessRoles = [
  'Admin',
  'Planner',
  'Printing Manager',
  'Production Head',
  'Dispatch Executive',
  'QC Manager',
];

const UserSidebar: React.FC<UserSidebarProps> = ({ open, onClose, userName = 'Admin', onLogout, onOptionSelect }) => {
  const [manageAccessMode, setManageAccessMode] = useState(false);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-transparent bg-opacity-40 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full
          w-4/5 sm:w-80 md:w-96 lg:w-[22rem] xl:w-[24rem] 2xl:w-[26rem] max-w-full
          bg-white z-50 shadow-2xl
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-8">
          <div className="bg-blue-100 rounded-full p-6 mb-2">
            <img src={manageAccessMode ? settingsIcon : userIcon} alt="User" className="h-16 w-16" />
          </div>
          <div className="text-xl font-semibold mb-6">{userName}</div>
          <div className="w-full flex flex-col gap-0">
            {manageAccessMode ? (
              <>
                {accessRoles.map(role => (
                  <React.Fragment key={role}>
                    <button className="w-full text-left px-6 py-3 text-base font-medium hover:bg-blue-50 focus:outline-none hover:cursor-pointer">
                      {role}
                    </button>
                    <div className="border-b border-gray-200 mx-6" />
                  </React.Fragment>
                ))}
              </>
            ) : (
              <>
                {menuOptions.map(option => (
                  <React.Fragment key={option}>
                    <button
                      className="w-full text-left px-6 py-3 text-base font-medium hover:bg-blue-50 focus:outline-none hover:cursor-pointer"
                      onClick={() => {
                        if (option === "Manage Access") {
                          setManageAccessMode(true);
                          return;
                        }
                        if (onOptionSelect) onOptionSelect(option);
                        if (option !== "Create new ID") {
                          onClose();
                        }
                      }}
                    >
                      {option}
                    </button>
                    <div className="border-b border-gray-200 mx-6" />
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="p-4">
          {manageAccessMode ? (
            <button
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-base hover:bg-gray-300 transition mb-2 hover:cursor-pointer"
              onClick={() => setManageAccessMode(false)}
            >
              Back
            </button>
          ) : null}
          <button
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold text-base hover:bg-[#0099cc] transition"
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
