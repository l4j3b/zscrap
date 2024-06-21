import { getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Field, FieldError } from '~/components/app/Field';
import { InputConform } from '~/components/conform/Input';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';

import { useUpdateScraperAction } from '../actions+/update';

export function UpdateScraperDialog({
  scraperId,
  scraperName,
}: {
  scraperId: string;
  scraperName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const newScraperUrl = useUpdateScraperAction(scraperId);
  const [form, fields] = useForm({
    id: `update-scraper-form_${scraperName}`,
    constraint: getZodConstraint(newScraperUrl.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      name: scraperName,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: newScraperUrl.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      (e.target as HTMLFormElement).querySelector('input')?.blur();
      const result = await newScraperUrl.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsOpen(false);
        toast.success('Scraper updated.');
      }
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="link" size="icon">
          <Pencil className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-max">
        <newScraperUrl.Form {...getFormProps(form)} action={newScraperUrl.actionPath} method="POST">
          <DialogHeader>
            <DialogTitle>Edit scraper</DialogTitle>
          </DialogHeader>

          <div>
            <Field className="min-w-72">
              <Label htmlFor={fields.name.id}>Name</Label>
              <InputConform meta={fields.name} type="text" />
              <FieldError>{fields.name.errors}</FieldError>
            </Field>
          </div>

          <DialogFooter>
            <Button type="submit" loading={newScraperUrl.submitting}>
              Update
            </Button>
          </DialogFooter>
        </newScraperUrl.Form>
      </DialogContent>
    </Dialog>
  );
}
