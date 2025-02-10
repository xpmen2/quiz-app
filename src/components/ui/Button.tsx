type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
};

export default function Button({
  onClick,
  children,
  disabled = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg 
                 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed 
                 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}