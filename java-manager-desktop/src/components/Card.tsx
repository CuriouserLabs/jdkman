import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  style?: React.CSSProperties;
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className, padding = "md", style, onClick }: CardProps) {
  return (
    <div
      style={style}
      onClick={onClick}
      className={clsx(
        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
        "rounded-xl shadow-sm",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center justify-between gap-4 mb-4", className)}>
      {children}
    </div>
  );
}
