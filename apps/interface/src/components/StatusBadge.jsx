import React from 'react';
import { STEPS } from '../constants';

const statusConfig = {
  Pending: {
    label: 'Pending Payment',
    color: 'bg-[#f4efe4] text-[#6b583e] border-[#cfc3aa]',
    dot: 'bg-[#a39075]'
  },
  Payment_Verified: {
    label: 'Payment Verified',
    color: 'bg-[#fef6e7] text-[#8a5b12] border-[#f5cc7f]',
    dot: 'bg-[#d98214]'
  },
  Vehicle_Assigned: {
    label: 'Vehicle Assigned',
    color: 'bg-[#edf4fb] text-[#1b5087] border-[#9ec0e6]',
    dot: 'bg-[#2b6cb0]'
  },
  On_Delivery: {
    label: 'On Delivery',
    color: 'bg-[#f5eeff] text-[#55278c] border-[#cfb5f5]',
    dot: 'bg-[#7c3aed]'
  },
  Waiting_Verification: {
    label: 'Waiting Verification',
    color: 'bg-[#fff0e6] text-[#9c4314] border-[#fbb38b]',
    dot: 'bg-[#ea580c]'
  },
  Verified: {
    label: 'Field Verified',
    color: 'bg-[#e6f7f5] text-[#146b62] border-[#81d8cf]',
    dot: 'bg-[#0d9488]'
  },
  Completed: {
    label: 'Expedition Completed',
    color: 'bg-[#e6f8ee] text-[#136336] border-[#7ed49d]',
    dot: 'bg-[#16a34a]'
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'bg-[#fdeeed] text-[#8c1d18] border-[#f7a29e]',
    dot: 'bg-[#dc2626]'
  }
};

export const ProgressStepper = ({ currentStatus }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="my-4 p-3 bg-[#fdf2f2] border border-[#f5c2c2] rounded text-[#8b1c1c] text-xs font-semibold flex items-center justify-center gap-2">
        <span>⚠ Order Telah Dibatalkan (Cancelled)</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="w-full py-4 my-2">
      <div className="flex items-center justify-between relative px-2">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-3.5 h-[3px] bg-[#d5cbba] -z-0"></div>

        {/* Active progress fill line */}
        <div
          className="absolute left-6 top-3.5 h-[3px] bg-[#853c12] transition-all duration-300 -z-0"
          style={{
            width: `${Math.max(0, (Math.min(currentIndex, STEPS.length - 1) / (STEPS.length - 1)) * 100)}%`
          }}
        ></div>

        {STEPS.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center relative z-10 w-16">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                  isPassed
                    ? 'bg-[#853c12] text-white border-[#59260a] shadow-xs'
                    : 'bg-[#e8dec9] text-[#73654b] border-[#cfc4ac]'
                } ${isCurrent ? 'ring-3 ring-[#f5cc7f] scale-105' : ''}`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 text-center leading-tight tracking-tight ${
                  isCurrent
                    ? 'font-bold text-[#853c12]'
                    : isPassed
                    ? 'font-semibold text-stone-800'
                    : 'text-stone-500'
                }`}
              >
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
    dot: 'bg-stone-500'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-full font-serif tracking-wide shadow-2xs ${config.color}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
