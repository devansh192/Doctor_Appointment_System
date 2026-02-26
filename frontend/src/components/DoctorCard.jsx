import React from 'react';
import { FaUserMd, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const specialColorMap = {
  Cardiology: 'bg-red-100 text-red-700',
  Dermatology: 'bg-pink-100 text-pink-700',
  Neurology: 'bg-purple-100 text-purple-700',
  Pediatrics: 'bg-sky-100 text-sky-700',
  Orthopedics: 'bg-orange-100 text-orange-700',
  Oncology: 'bg-rose-100 text-rose-700',
  Psychiatry: 'bg-violet-100 text-violet-700',
  Gynecology: 'bg-fuchsia-100 text-fuchsia-700',
  default: 'bg-blue-100 text-blue-700',
};

const getSpecColor = (spec) => specialColorMap[spec] || specialColorMap.default;

const DoctorCard = ({ doctor, onDelete }) => {
  const {
    _id,
    doctorId,
    name,
    specialization,
    maxDailyPatients,
    currentAppointments,
    isAvailable,
    slotsRemaining,
  } = doctor;

  const fillPercent = Math.min(100, (currentAppointments / maxDailyPatients) * 100);
  const isFull = currentAppointments >= maxDailyPatients;

  const progressColor = isFull
    ? 'bg-red-500'
    : fillPercent >= 75
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div
      className={`card-hover p-5 flex flex-col gap-4 ${
        isFull ? 'opacity-75 border-red-100' : 'border-gray-100'
      } animate-slide-up`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isFull ? 'bg-red-100' : 'bg-primary-100'
            }`}
          >
            <FaUserMd className={`text-lg ${isFull ? 'text-red-600' : 'text-primary-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">Dr. {name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${getSpecColor(specialization)}`}>
              {specialization}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {isFull ? (
            <span className="badge badge-red gap-1">
              <FaTimesCircle className="text-xs" /> Full
            </span>
          ) : (
            <span className="badge badge-green gap-1">
              <FaCheckCircle className="text-xs" /> Available
            </span>
          )}
          <span className="text-xs text-gray-400 font-mono">{doctorId}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg py-2 px-1">
          <p className="text-lg font-bold text-gray-800">{currentAppointments}</p>
          <p className="text-[11px] text-gray-500 font-medium">Booked</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2 px-1">
          <p className={`text-lg font-bold ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
            {slotsRemaining ?? maxDailyPatients - currentAppointments}
          </p>
          <p className="text-[11px] text-gray-500 font-medium">Remaining</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2 px-1">
          <p className="text-lg font-bold text-primary-600">{maxDailyPatients}</p>
          <p className="text-[11px] text-gray-500 font-medium">Max/Day</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Capacity</span>
          <span>{Math.round(fillPercent)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full progress-bar transition-all ${progressColor}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      {/* Delete */}
      <div className="flex justify-end pt-1 border-t border-gray-50">
        <button
          onClick={() => onDelete(_id, name)}
          className="btn-danger flex items-center gap-1.5 text-xs py-1.5 px-3"
          title="Remove doctor"
        >
          <FaTrashAlt className="text-xs" /> Remove
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
