import React from 'react';
import { FaHospital, FaUserMd, FaCalendarPlus, FaList } from 'react-icons/fa';

const tabs = [
  { id: 'add-doctor', label: 'Add Doctor', icon: FaUserMd },
  { id: 'view-doctors', label: 'View Doctors', icon: FaList },
  { id: 'book-appointment', label: 'Book Appointment', icon: FaCalendarPlus },
];

const Navbar = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 py-4 border-b border-gray-100">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl shadow-sm">
            <FaHospital className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Hospital Appointment Scheduler
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Efficient. Fair. Smart.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-1 pt-1" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${id}`}
                onClick={() => onTabChange(id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 border border-b-white border-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`text-base ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
