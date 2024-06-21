export const Field = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`
        relative flex flex-col gap-3
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const FieldError = ({ children }: { children: React.ReactNode }) => {
  return <div className="absolute bottom-0 h-0 text-xs text-red-600">{children}</div>;
};
