import React from 'react';

/**
 * SafeAreaLayout wraps the app content to respect iOS safe areas (notch, home indicator, etc)
 * and applies mobile-friendly layout conventions.
 */
export const SafeAreaLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden"
      style={{
        paddingTop: 'max(0px, env(safe-area-inset-top))',
        paddingRight: 'max(0px, env(safe-area-inset-right))',
        paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0px, env(safe-area-inset-left))',
      }}
    >
      {children}
    </div>
  );
};

/**
 * MobileOptimizedButton: Touch-friendly button with min 44x44 tap target
 */
export const MobileOptimizedButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...props }) => {
  return (
    <button
      className={`min-h-[44px] min-w-[44px] touch-manipulation select-none ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * MobileOptimizedInput: Touch-friendly input with min 44px height
 */
export const MobileOptimizedInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = ({ className, ...props }) => {
  return (
    <input
      className={`min-h-[44px] text-base touch-manipulation select-none ${className || ''}`}
      {...props}
    />
  );
};

export default SafeAreaLayout;
