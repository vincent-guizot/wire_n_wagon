import React from 'react';

const statusConfig = {
  Pending: {
    label: 'Pending Payment',
    color: 'bg-stone-200 text-stone-800 border-stone-400',
    dot: 'bg-stone-500'
  },
  Payment_Verified: {
    label: 'Payment Verified',
    color: 'bg-amber-100 text-amber-900 border-amber-400',
    dot: 'bg-amber-600'
  },
  Vehicle_Assigned: {
    label: 'Vehicle Assigned',
    color: 'bg-blue-100 text-blue-900 border-blue-400',
    dot: 'bg-blue-600'
  },
  On_Delivery: {
    label: 'On Delivery',
    color: 'bg-purple-100 text-purple-900 border-purple-400',
    dot: 'bg-purple-600'
  },
  Waiting_Verification: {
    label: 'Dual ACC Verified (Awaiting Field Check)',
    color: 'bg-orange-100 text-orange-900 border-orange-400',
    dot: 'bg-orange-600'
  },
  Verified: {
    label: 'Field Verified',
    color: 'bg-teal-100 text-teal-900 border-teal-400',
    dot: 'bg-teal-600'
  },
  Completed: {
    label: 'Expedition Completed',
    color: 'bg-emerald-100 text-emerald-950 border-emerald-500',
    dot: 'bg-emerald-600'
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-100 text-rose-900 border-rose-400',
    dot: 'bg-rose-600'
  }
};

export const STEPS = [
  'Pending',
  'Payment_Verified',
  'Vehicle_Assigned',
  'On_Delivery',
  'Waiting_Verification',
  'Verified',
  'Completed'
];

export const ProgressStepper = ({ currentStatus }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-800 text-sm font-semibold flex items-center justify-center gap-2">
        <span>⚠ Order Telah Dibatalkan (Cancelled)</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-300 -z-0"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-800 transition-all duration-300 -z-0"
          style={{ width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%` }}
        ></div>

        {STEPS.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                  isPassed
                    ? 'bg-amber-800 text-stone-100 border-amber-900 shadow'
                    : 'bg-stone-200 text-stone-500 border-stone-300'
                } ${isCurrent ? 'ring-4 ring-amber-300 scale-110' : ''}`}
              >
                {idx + 1}
              </div>
              <span className={`text-[10px] mt-1 hidden sm:block text-center max-w-[70px] leading-tight ${
                isCurrent ? 'font-bold text-amber-950' : 'text-stone-600'
              }`}>
                {step.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    color: 'bg-stone-200 text-stone-800 border-stone-300',
    dot: 'bg-stone-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-sm font-mono tracking-wide ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
