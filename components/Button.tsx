import React from 'react';

type Variant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'neutral'
  | 'warning'
  | 'success'
  | 'whatsapp'
  | 'telegram';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const baseClasses = 'inline-flex items-center justify-center px-6 py-3 font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed gap-2';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-md focus:ring-gray-500',
  tertiary: 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400 shadow-sm focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md focus:ring-red-500',
  neutral: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md focus:ring-yellow-400',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-md focus:ring-green-500',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1EBE57] shadow-md focus:ring-[#128C7E]',
  telegram: 'bg-[#0088cc] text-white hover:bg-[#007AB8] shadow-md focus:ring-[#229ED9]',
};

const getClasses = (variant: Variant = 'primary', fullWidth?: boolean, extra?: string) => {
  const width = fullWidth ? 'w-full' : '';
  return [baseClasses, variantClasses[variant], width, extra].filter(Boolean).join(' ');
};

export const getButtonClasses = (variant: Variant = 'primary', options?: { fullWidth?: boolean; extra?: string }) => {
  return getClasses(variant, options?.fullWidth, options?.extra);
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', fullWidth, className, type = 'button', ...props }) => {
  return (
    <button
      type={type}
      className={getClasses(variant, fullWidth, className)}
      {...props}
    />
  );
};

export type { Variant as ButtonVariant };

export default Button;
