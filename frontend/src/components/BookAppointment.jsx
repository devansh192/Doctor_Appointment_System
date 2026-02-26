import React, { useState, useEffect } from 'react';
import {
  FaCalendarPlus,
  FaUser,
  FaStethoscope,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { appointmentAPI, doctorAPI } from '../services/api';

const BookAppointment = ({ onOutput, onRefreshDoctors }) => {
  const [form, setForm] = useState({ patientName: '', specialization: '', customSpec: '' });
  const [useCustomSpec, setUseCustomSpec] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [specializations, setSpecializations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await doctorAPI.getSpecializations();
        setSpecializations(response.data || []);
      } catch {
        // silently fail
      }
    };
    const fetchRecent = async () => {
      setLoadingRecent(true);
      try {
        const response = await appointmentAPI.getAll({ limit: 5 });
        setRecentBookings(response.data || []);
      } catch {
        // silently fail
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchSpecializations();
    fetchRecent();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.patientName.trim()) errs.patientName = 'Patient name is required';
    else if (form.patientName.trim().length < 2) errs.patientName = 'Name must be at least 2 characters';
    const spec = useCustomSpec ? form.customSpec.trim() : form.specialization;
    if (!spec) errs.specialization = 'Specialization is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const spec = useCustomSpec ? form.customSpec.trim() : form.specialization;
    const payload = { patientName: form.patientName.trim(), specialization: spec };

    try {
      const response = await appointmentAPI.book(payload);

      if (response.status === 'booked') {
        toast.success(response.message);
        onOutput({
          type: 'success',
          title: '✅ Appointment Booked',
          message: response.message,
          details: [
            { label: 'Patient', value: form.patientName.trim() },
            { label: 'Specialization', value: spec },
            { label: 'Assigned Doctor', value: `Dr. ${response.data.doctor.name}` },
            { label: 'Doctor ID', value: response.data.doctor.doctorId },
            { label: 'Today\'s Bookings', value: `${response.data.doctor.currentAppointments} / ${response.data.doctor.maxDailyPatients}` },
          ],
          timestamp: new Date(),
        });
        setRecentBookings((prev) => [response.data.appointment, ...prev.slice(0, 4)]);
        onRefreshDoctors();
        setForm({ patientName: '', specialization: '', customSpec: '' });
        setErrors({});
      }
    } catch (error) {
      const msg = error.message || 'Booking failed';
      const isRejected = error.status === 'rejected' || error.status === 409;

      if (isRejected) {
        toast.error(msg, { duration: 5000 });
        onOutput({
          type: 'error',
          title: '❌ Booking Rejected',
          message: msg,
          details: [
            { label: 'Patient', value: form.patientName.trim() },
            { label: 'Requested Specialization', value: spec },
            { label: 'Reason', value: msg },
          ],
          timestamp: new Date(),
        });
      } else {
        toast.error(msg);
        onOutput({
          type: 'error',
          title: 'Booking Failed',
          message: msg,
          timestamp: new Date(),
        });
      }
      if (error.errors) {
        const fieldErrors = {};
        error.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
      {/* Booking Form */}
      <div className="lg:col-span-2 card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FaCalendarPlus className="text-emerald-600 text-lg" />
          </div>
          <div>
            <h2 className="section-title">Book Appointment</h2>
            <p className="text-sm text-gray-500">
              System auto-assigns the doctor with fewest bookings
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Algorithm info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 flex items-start gap-2">
            <span className="text-blue-500 mt-0.5 text-sm flex-shrink-0">ℹ</span>
            <p className="text-sm text-blue-700">
              <strong>Smart Allocation:</strong> The system selects the doctor with the{' '}
              <strong>fewest current appointments</strong> in your requested specialization. If all
              doctors are full, the booking is rejected.
            </p>
          </div>

          <div className="space-y-5">
            {/* Patient Name */}
            <div>
              <label className="label" htmlFor="patientName">
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-gray-400 text-xs" /> Patient Name{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                placeholder="Enter patient's full name"
                className={`input-field ${errors.patientName ? 'border-red-400 focus:ring-red-400' : ''}`}
                disabled={loading}
                autoComplete="off"
              />
              {errors.patientName && <p className="error-text">⚠ {errors.patientName}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="label" htmlFor="bookSpecialization">
                <span className="flex items-center gap-1.5">
                  <FaStethoscope className="text-gray-400 text-xs" /> Required Specialization{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setUseCustomSpec(false)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    !useCustomSpec ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  From available
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomSpec(true)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    useCustomSpec ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Enter custom
                </button>
              </div>
              {!useCustomSpec ? (
                <select
                  id="bookSpecialization"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className={`input-field ${errors.specialization ? 'border-red-400 focus:ring-red-400' : ''}`}
                  disabled={loading}
                >
                  <option value="">-- Select Specialization --</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="customSpec"
                  value={form.customSpec}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className={`input-field ${errors.specialization ? 'border-red-400 focus:ring-red-400' : ''}`}
                  disabled={loading}
                />
              )}
              {errors.specialization && <p className="error-text">⚠ {errors.specialization}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button type="submit" className="btn-success flex items-center gap-2" disabled={loading}>
              {loading ? (
                <><FaSpinner className="animate-spin" /> Processing...</>
              ) : (
                <><FaCalendarPlus /> Book Appointment</>
              )}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setForm({ patientName: '', specialization: '', customSpec: '' }); setErrors({}); }}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Recent Bookings */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaHistory className="text-gray-400" />
          <h3 className="font-semibold text-gray-700">Recent Activity</h3>
        </div>
        {loadingRecent ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-primary-500 text-xl" />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaCalendarPlus className="text-4xl mx-auto mb-2 opacity-30" />
            <p className="text-sm">No recent bookings</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recentBookings.map((b, i) => (
              <li
                key={b._id || i}
                className={`p-3 rounded-lg border text-sm ${
                  b.status === 'booked'
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-medium text-gray-800">
                    {b.status === 'booked' ? (
                      <FaCheckCircle className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <FaTimesCircle className="text-red-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{b.patientName}</span>
                  </div>
                  <span
                    className={`badge flex-shrink-0 ${
                      b.status === 'booked' ? 'badge-green' : 'badge-red'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-5">{b.specialization}</p>
                {b.doctorName && (
                  <p className="text-xs text-gray-600 mt-0.5 ml-5">Dr. {b.doctorName}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
