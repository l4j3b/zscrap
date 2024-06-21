import { Link } from '@remix-run/react';
import { Fragment, ReactNode } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbWrapperProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export const BreadcrumbWrapper = ({
  items,
  separator = <BreadcrumbSeparator />,
}: BreadcrumbWrapperProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && separator}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
