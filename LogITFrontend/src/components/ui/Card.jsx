export const Card = ({ children, className = "", elevated = false }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${
      elevated ? "shadow-md hover:shadow-lg transition-shadow" : "shadow-sm"
    } ${className}`}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", withBorder = true }) => (
  <div
    className={`px-6 py-4 ${withBorder ? "border-b border-gray-200" : ""} ${className}`}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", variant = "h3" }) => {
  const titleClasses = {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-bold",
    h3: "text-xl font-bold",
    h4: "text-lg font-semibold",
  };
  return (
    <h3 className={`${titleClasses[variant]} text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "", padding = "md" }) => {
  const paddingClasses = {
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
    none: "p-0",
  };
  return (
    <div className={`${paddingClasses[padding]} ${className}`}>{children}</div>
  );
};

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);
