import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import AddDoctorForm from './components/AddDoctorForm';
import DoctorList from './components/DoctorList';
import BookAppointment from './components/BookAppointment';
import OutputPanel from './components/OutputPanel';

const App = () => {
  const [activeTab, setActiveTab] = useState('add-doctor');
  const [outputs, setOutputs] = useState([]);
  const [doctorRefreshKey, setDoctorRefreshKey] = useState(0);

  const handleOutput = useCallback((entry) => {
    setOutputs((prev) => [...prev.slice(-19), entry]);
  }, []);

  const handleDoctorAdded = useCallback(() => {
    setDoctorRefreshKey((k) => k + 1);
  }, []);

  const handleRefreshDoctors = useCallback(() => {
    setDoctorRefreshKey((k) => k + 1);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'add-doctor':
        return (
          <AddDoctorForm
            onDoctorAdded={handleDoctorAdded}
            onOutput={handleOutput}
          />
        );
      case 'view-doctors':
        return (
          <DoctorList
            refreshTrigger={doctorRefreshKey}
            onOutput={handleOutput}
          />
        );
      case 'book-appointment':
        return (
          <BookAppointment
            onOutput={handleOutput}
            onRefreshDoctors={handleRefreshDoctors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#1f2937',
            color: '#f9fafb',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
        }}
      />

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-5">
          {/* Tab Content */}
          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={activeTab}
            className="w-full"
          >
            {renderContent()}
          </div>

          {/* Output Panel – always visible */}
          <OutputPanel
            outputs={outputs}
            onClear={() => setOutputs([])}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 bg-white">
        Hospital Appointment Scheduler &copy; {new Date().getFullYear()} &mdash; Built with MERN Stack
      </footer>
    </div>
  );
};

export default App;
