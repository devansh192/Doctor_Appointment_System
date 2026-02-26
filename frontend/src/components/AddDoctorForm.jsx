import React, { useState } from 'react';
import { FaUserMd, FaStethoscope, FaCalendarDay, FaIdCard, FaPlus, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { doctorAPI } from '../services/api';

const COMMON_SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Medicine',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

const initialForm = {
  name: '',
  specialization: '',
  customSpecialization: '',
  maxDailyPatients: '',
  doctorId: '',
};

const AddDoctorForm = ({ onDoctorAdded, onOutput }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [useCustomSpec, setUseCustomSpec] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Doctor name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    const spec = useCustomSpec ? form.customSpecialization.trim() : form.specialization;
    if (!spec) errs.specialization = 'Specialization is required';

    if (!form.maxDailyPatients) errs.maxDailyPatients = 'Max daily patients is required';
    else if (parseInt(form.maxDailyPatients) < 1 || parseInt(form.maxDailyPatients) > 100)
      errs.maxDailyPatients = 'Must be between 1 and 100';

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
    const payload = {
      name: form.name.trim(),
      specialization: useCustomSpec ? form.customSpecialization.trim() : form.specialization,
      maxDailyPatients: parseInt(form.maxDailyPatients),
      ...(form.doctorId.trim() && { doctorId: form.doctorId.trim() }),
    };

    try {
      const response = await doctorAPI.add(payload);
      toast.success(response.message || 'Doctor added successfully!');
      onOutput({
        type: 'success',
        title: 'Doctor Added',
        message: response.message,
        details: [
          { label: 'Name', value: `Dr. ${response.data.name}` },
          { label: 'ID', value: response.data.doctorId },
          { label: 'Specialization', value: response.data.specialization },
          { label: 'Max Daily Patients', value: response.data.maxDailyPatients },
        ],
        timestamp: new Date(),
      });
      onDoctorAdded(response.data);
      setForm(initialForm);
      setErrors({});
      setUseCustomSpec(false);
    } catch (error) {
      const msg = error.message || 'Failed to add doctor';
      toast.error(msg);
      onOutput({
        type: 'error',
        title: 'Add Doctor Failed',
        message: msg,
        timestamp: new Date(),
      });
      if (error.errors) {
        const fieldErrors = {};
        error.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setUseCustomSpec(false);
  };

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <FaUserMd className="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 className="section-title">Add New Doctor</h2>
          <p className="text-sm text-gray-500">Fill in the details to register a new doctor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Doctor Name */}
          <div className="md:col-span-2">
            <label className="label" htmlFor="name">
              <span className="flex items-center gap-1.5">
                <FaUserMd className="text-gray-400 text-xs" /> Doctor Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Smith"
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              disabled={loading}
              autoComplete="off"
            />
            {errors.name && <p className="error-text">⚠ {errors.name}</p>}
          </div>

          {/* Specialization */}
          <div className="md:col-span-2">
            <label className="label" htmlFor="specialization">
              <span className="flex items-center gap-1.5">
                <FaStethoscope className="text-gray-400 text-xs" /> Specialization <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setUseCustomSpec(false)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  !useCustomSpec ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Select from list
              </button>
              <button
                type="button"
                onClick={() => setUseCustomSpec(true)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  useCustomSpec ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Enter custom
              </button>
            </div>
            {!useCustomSpec ? (
              <select
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className={`input-field ${errors.specialization ? 'border-red-400 focus:ring-red-400' : ''}`}
                disabled={loading}
              >
                <option value="">-- Select Specialization --</option>
                {COMMON_SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="customSpecialization"
                value={form.customSpecialization}
                onChange={handleChange}
                placeholder="e.g. Sports Medicine"
                className={`input-field ${errors.specialization ? 'border-red-400 focus:ring-red-400' : ''}`}
                disabled={loading}
                autoComplete="off"
              />
            )}
            {errors.specialization && <p className="error-text">⚠ {errors.specialization}</p>}
          </div>

          {/* Max Daily Patients */}
          <div>
            <label className="label" htmlFor="maxDailyPatients">
              <span className="flex items-center gap-1.5">
                <FaCalendarDay className="text-gray-400 text-xs" /> Max Daily Patients <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="number"
              id="maxDailyPatients"
              name="maxDailyPatients"
              value={form.maxDailyPatients}
              onChange={handleChange}
              placeholder="e.g. 20"
              min={1}
              max={100}
              className={`input-field ${errors.maxDailyPatients ? 'border-red-400 focus:ring-red-400' : ''}`}
              disabled={loading}
            />
            {errors.maxDailyPatients && <p className="error-text">⚠ {errors.maxDailyPatients}</p>}
          </div>

          {/* Doctor ID (optional) */}
          <div>
            <label className="label" htmlFor="doctorId">
              <span className="flex items-center gap-1.5">
                <FaIdCard className="text-gray-400 text-xs" /> Doctor ID
                <span className="text-xs text-gray-400 font-normal">(optional – auto-generated)</span>
              </span>
            </label>
            <input
              type="text"
              id="doctorId"
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              placeholder="e.g. DOC-001"
              className="input-field"
              disabled={loading}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? (
              <><FaSpinner className="animate-spin" /> Adding Doctor...</>
            ) : (
              <><FaPlus /> Add Doctor</>
            )}
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={loading}>
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctorForm;
