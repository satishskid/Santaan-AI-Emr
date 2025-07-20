import React from 'react';

// Design System Constants - Optimized for Healthcare Stress Reduction
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0891b2', // Calming teal instead of blue
    600: '#0e7490', // Stress-reducing primary
    700: '#155e75',
    900: '#164e63'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981', // Soft sage green
    600: '#059669', // Gentle success color
    700: '#047857'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b', // Keep existing - works well
    600: '#d97706',
    700: '#b45309'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  gray: {
    50: '#fefefe', // Soft cream instead of stark white
    100: '#f8fafc', // Warmer gray
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  // New stress-reduction color palette
  calm: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0891b2',
    600: '#0e7490'
  },
  sage: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669'
  }
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

// 8px Baseline Grid System for Consistent Spacing
export const SPACING = {
  xxs: '0.25rem', // 4px - inline elements
  xs: '0.5rem',   // 8px - related elements
  sm: '1rem',     // 16px - component padding
  md: '1.5rem',   // 24px - section spacing
  lg: '2rem',     // 32px - major sections
  xl: '3rem',     // 48px - page sections
  xxl: '4rem'     // 64px - major layout areas
};

// Typography Scale for Better Readability
export const TYPOGRAPHY = {
  scale: {
    xs: '0.75rem',    // 12px - small text
    sm: '0.875rem',   // 14px - caption
    base: '1rem',     // 16px - body text (increased from 14px)
    lg: '1.125rem',   // 18px - large body
    xl: '1.25rem',    // 20px - h3
    '2xl': '1.5rem',  // 24px - h2
    '3xl': '2rem'     // 32px - h1
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.6',    // Optimized for readability
    relaxed: '1.8'
  }
};

// Enhanced Card Component with Stress-Reducing Design
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'calm';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200'; // Increased border radius for softer feel
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100',
    elevated: 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    calm: 'bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-cyan-100 shadow-sm'
  };
  const paddingClasses = {
    sm: 'p-4',      // Consistent with spacing system
    md: 'p-6',      // 24px - optimal for content
    lg: 'p-8'       // 32px - spacious layouts
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

// Enhanced Button Component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 active:transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm', // Calming teal
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400 border border-gray-300',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm', // Soft sage
    warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-50 text-gray-600 focus:ring-gray-400'
  };

  // Optimized sizing with proper touch targets and visual hierarchy
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8 min-w-16',      // 32px height - compact
    md: 'px-4 py-2 text-sm h-10 min-w-20',       // 40px height - standard
    lg: 'px-6 py-3 text-base h-11 min-w-24'      // 44px height - primary actions
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// Enhanced Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const containerClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${containerClasses[size]}`}>
        <div
          className={`${containerClasses[size]} rounded-full transition-all duration-300 ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'border-l-4 border-blue-500',
    success: 'border-l-4 border-green-500',
    warning: 'border-l-4 border-yellow-500',
    danger: 'border-l-4 border-red-500'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };

  return (
    <Card variant="elevated" className={`${variantClasses[variant]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && trend && (
            <p className={`text-sm mt-1 ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
    </Card>
  );
};
