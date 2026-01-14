const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-purple-800 text-white hover:bg-purple-700 focus:ring-purple-400",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "border border-gray-300 bg-transparent hover:bg-purple-500 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm lg:px-3 lg:text-lg lg:py-1.5 ",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
