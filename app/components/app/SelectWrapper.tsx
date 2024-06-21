import { ComponentProps } from 'react';

import {
  SelectTrigger,
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';

export const SelectWrapper = ({
  items,
  placeholder,
  className,
  loading,
  id,
  ...props
}: {
  items: { name: string; value: string }[];
  placeholder: string;
  className?: string;
  loading?: boolean;
  id: string;
} & ComponentProps<typeof Select>) => {
  return (
    <Select {...props}>
      <SelectTrigger id={id} className={className} loading={loading}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => {
          return (
            <SelectItem key={item.value} value={item.value}>
              {item.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
