import { ReactNode } from 'react';

export const SidebarLayout = ({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) => (
  <div
    className={`
      flex flex-1 flex-col
      md:flex-row md:gap-2
    `}
  >
    <div className="mt-4">{sidebar}</div>

    <div className="flex flex-1 flex-col">{children}</div>
  </div>
);
