import { cn } from '~/lib/utils';

interface GradientTextProps {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

export const gradientTextStyle = cn(`
  overflow-visible bg-gradient-to-tr from-violet-700 from-20% via-pink-500 via-40% to-orange-500
  to-90% bg-clip-text text-transparent transition duration-300
`);

export const gradientTextStyleHover = cn(`
  overflow-visible bg-gradient-to-tr from-violet-700 from-0% via-pink-500 via-20% to-orange-500
  to-70% bg-clip-text text-transparent opacity-0 transition duration-300
  hover:opacity-100
`);

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span className="relative">
      <span className={cn(gradientTextStyle, className)}>{children}</span>
      <span className={cn(gradientTextStyleHover, 'absolute left-0 top-0', className)}>
        {children}
      </span>
    </span>
  );
}
