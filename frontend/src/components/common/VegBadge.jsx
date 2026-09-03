import React from 'react';

const VegBadge = ({ type = 'VEG', showText = false, className = '' }) => {
  const isVeg = type === 'VEG';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {isVeg ? (
        <span className="w-4 h-4 rounded-[3px] border-[1.5px] border-emerald-600 flex items-center justify-center p-[2px] bg-emerald-50" title="Vegetarian">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        </span>
      ) : (
        <span className="w-4 h-4 rounded-[3px] border-[1.5px] border-red-600 flex items-center justify-center p-[2px] bg-red-50" title="Non-Vegetarian">
          <span
            style={{
              width: 0,
              height: 0,
              borderLeft: '3.5px solid transparent',
              borderRight: '3.5px solid transparent',
              borderBottom: '6px solid #dc2626',
            }}
          ></span>
        </span>
      )}
      {showText && (
        <span className={`text-xs font-semibold ${isVeg ? 'text-emerald-700' : 'text-red-700'}`}>
          {isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </span>
  );
};

export default VegBadge;
