import React from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTerminal,
  FaTrashAlt,
  FaClock,
} from 'react-icons/fa';

const typeConfig = {
  success: {
    icon: FaCheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    label: 'SUCCESS',
  },
  error: {
    icon: FaTimesCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    badgeBg: 'bg-red-100 text-red-700',
    label: 'ERROR',
  },
  info: {
    icon: FaInfoCircle,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    badgeBg: 'bg-blue-100 text-blue-700',
    label: 'INFO',
  },
  warning: {
    icon: FaExclamationTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    badgeBg: 'bg-amber-100 text-amber-700',
    label: 'WARNING',
  },
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const OutputEntry = ({ entry }) => {
  const config = typeConfig[entry.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border p-4 animate-slide-up ${config.bg} ${config.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`${config.iconColor} text-base flex-shrink-0 mt-0.5`} />
          <span className={`font-semibold text-sm ${config.titleColor}`}>{entry.title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge text-[10px] ${config.badgeBg}`}>{config.label}</span>
          {entry.timestamp && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <FaClock className="text-[10px]" />
              {formatTime(entry.timestamp)}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 ml-6">{entry.message}</p>

      {/* Details */}
      {entry.details && entry.details.length > 0 && (
        <div className="mt-3 ml-6 bg-white bg-opacity-60 rounded-md p-3 border border-white">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {entry.details.map((d, i) => (
              <div key={i} className="flex flex-col">
                <dt className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  {d.label}
                </dt>
                <dd className="text-sm font-medium text-gray-800">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

const OutputPanel = ({ outputs, onClear }) => {
  return (
    <div className="card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <FaTerminal className="text-gray-400 text-xs" />
            <span className="text-gray-300 text-sm font-medium font-mono">Output Panel</span>
          </div>
          {outputs.length > 0 && (
            <span className="badge bg-gray-700 text-gray-300 text-[10px]">
              {outputs.length} event{outputs.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {outputs.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 text-xs px-2.5 py-1 rounded hover:bg-gray-800 transition-colors"
            title="Clear output"
          >
            <FaTrashAlt className="text-[10px]" /> Clear
          </button>
        )}
      </div>

      {/* Output entries */}
      <div className="p-4 bg-gray-50 min-h-[120px] max-h-80 overflow-y-auto">
        {outputs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400 gap-2">
            <FaTerminal className="text-2xl opacity-30" />
            <p className="text-sm font-mono">Waiting for operations...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...outputs].reverse().map((entry, i) => (
              <OutputEntry key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
