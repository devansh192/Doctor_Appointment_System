import React, { useState, useEffect, useCallback } from 'react';
import {
  FaList,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaCalendarCheck,
  FaSpinner,
  FaUserMd,
  FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { doctorAPI } from '../services/api';
import DoctorCard from './DoctorCard';

const DoctorList = ({ refreshTrigger, onOutput }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctors');
      toast.error(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors, refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove Dr. ${name} from the system?`)) return;
    try {
      const response = await doctorAPI.delete(id);
      toast.success(response.message || 'Doctor removed');
      onOutput({
        type: 'warning',
        title: 'Doctor Removed',
        message: response.message,
        timestamp: new Date(),
      });
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to remove doctor');
    }
  };

  const handleResetDaily = async () => {
    if (!window.confirm('Reset ALL doctors\' appointment counts to 0 for today?')) return;
    setResetting(true);
    try {
      const response = await doctorAPI.resetDaily();
      toast.success(response.message);
      onOutput({
        type: 'info',
        title: 'Daily Reset',
        message: response.message,
        timestamp: new Date(),
      });
      await fetchDoctors();
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  // Filter + sort logic
  const filtered = doctors
    .filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase()) ||
        d.doctorId.toLowerCase().includes(search.toLowerCase());
      const matchAvail =
        filterAvailable === 'all'
          ? true
          : filterAvailable === 'available'
          ? d.currentAppointments < d.maxDailyPatients
          : d.currentAppointments >= d.maxDailyPatients;
      return matchSearch && matchAvail;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'specialization') return a.specialization.localeCompare(b.specialization);
      if (sortBy === 'appointments') return a.currentAppointments - b.currentAppointments;
      if (sortBy === 'available') return (b.maxDailyPatients - b.currentAppointments) - (a.maxDailyPatients - a.currentAppointments);
      return 0;
    });

  const stats = {
    total: doctors.length,
    available: doctors.filter((d) => d.currentAppointments < d.maxDailyPatients).length,
    full: doctors.filter((d) => d.currentAppointments >= d.maxDailyPatients).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FaList className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h2 className="section-title">Doctors Directory</h2>
              <p className="text-sm text-gray-500">{doctors.length} doctor(s) registered</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchDoctors}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              disabled={loading}
              title="Refresh list"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleResetDaily}
              className="flex items-center gap-2 text-sm py-2 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium transition-all disabled:opacity-50"
              disabled={resetting || loading}
              title="Reset daily appointment counts"
            >
              <FaCalendarCheck />
              {resetting ? 'Resetting...' : 'Reset Daily'}
            </button>
          </div>
        </div>

        {/* Stats pills */}
        {!loading && doctors.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="badge badge-gray gap-1">Total: {stats.total}</span>
            <span className="badge badge-green gap-1">Available: {stats.available}</span>
            <span className="badge badge-red gap-1">Full: {stats.full}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization or ID..."
              className="input-field pl-9"
            />
          </div>
          {/* Filter availability */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <FaFilter className="text-gray-400 text-sm" />
            <select
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value)}
              className="input-field w-auto py-2.5 text-sm"
            >
              <option value="all">All Doctors</option>
              <option value="available">Available Only</option>
              <option value="full">Fully Booked</option>
            </select>
          </div>
          {/* Sort */}
          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto py-2.5 text-sm"
            >
              <option value="name">Sort: Name</option>
              <option value="specialization">Sort: Specialization</option>
              <option value="appointments">Sort: Booked (↑)</option>
              <option value="available">Sort: Available (↓)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <FaSpinner className="animate-spin text-3xl text-primary-500" />
          <p className="text-sm font-medium">Loading doctors...</p>
        </div>
      ) : error ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <FaExclamationTriangle className="text-3xl text-red-500" />
          <p className="font-medium text-red-600">{error}</p>
          <button onClick={fetchDoctors} className="btn-primary text-sm mt-2">
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-center text-gray-400">
          <FaUserMd className="text-5xl text-gray-300" />
          <div>
            <p className="font-semibold text-gray-500 text-lg">
              {doctors.length === 0 ? 'No doctors registered yet' : 'No doctors match your filters'}
            </p>
            <p className="text-sm mt-1">
              {doctors.length === 0
                ? 'Go to "Add Doctor" tab to register the first doctor.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
          {search && (
            <button onClick={() => { setSearch(''); setFilterAvailable('all'); }} className="btn-secondary text-sm mt-2">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
