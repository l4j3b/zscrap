import { unstable_useControl as useControl, type FieldMetadata } from '@conform-to/react';
import { useRef, type ElementRef, type ComponentProps } from 'react';

import {
  SelectTrigger,
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';

export const SelectConform = ({
  meta,
  items,
  placeholder,
  className,
  loading,
  ...props
}: {
  meta: FieldMetadata<string>;
  items: { name: string; value: string }[];
  placeholder: string;
  className?: string;
  loading?: boolean;
} & ComponentProps<typeof Select>) => {
  const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null);
  const control = useControl(meta);

  return (
    <>
      <select
        name={meta.name}
        defaultValue={meta.initialValue ?? ''}
        className="sr-only"
        ref={control.register}
        aria-hidden
        tabIndex={-1}
        onFocus={() => {
          selectRef.current?.focus();
        }}
      >
        <option value="" />
        {items.map((option) => (
          <option key={option.value} value={option.value} />
        ))}
      </select>

      <Select
        {...props}
        value={control.value ?? ''}
        onValueChange={control.change}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <SelectTrigger id={meta.id} className={className} loading={loading}>
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
    </>
  );
};
