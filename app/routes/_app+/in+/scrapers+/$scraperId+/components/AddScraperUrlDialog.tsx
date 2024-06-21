import { getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Field, FieldError } from '~/components/app/Field';
import { TextareaConform } from '~/components/conform/Textarea';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

import { MAX_URLS, useAddScraperUrlsAction } from '../actions+/add-urls';

export function AddScraperUrlDialog({ scraperId }: { scraperId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlCount, setUrlCount] = useState(0);
  const addScraperUrlsAction = useAddScraperUrlsAction(scraperId);

  const [form, fields] = useForm({
    constraint: getZodConstraint(addScraperUrlsAction.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addScraperUrlsAction.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      (e.target as HTMLFormElement).querySelector('input')?.blur();
      const result = await addScraperUrlsAction.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsOpen(false);
        toast.success('URLs added.');
      }
    },
  });

  const onUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const urls = inputValue
      .split(/[,\n]+/) // Split by commas and newlines
      .map((url) => url.trim())
      .filter(Boolean);

    setUrlCount(urls.length);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2 size-5" /> Add URLs
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-max">
        <addScraperUrlsAction.Form
          {...getFormProps(form)}
          action={addScraperUrlsAction.actionPath}
          method="POST"
        >
          <DialogHeader>
            <DialogTitle>Add URLs</DialogTitle>
            <DialogDescription>
              Enter the URLs (one per line) to add them to the scraper to be processed.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Field className="min-w-72">
              <TextareaConform
                meta={fields.urls}
                rows={10}
                onChange={onUrlsChange} // Attach the handler for URL count and limiting
              />
              <FieldError>{fields.urls.errors}</FieldError>
              {/* Display URL count */}
              <p className="mt-2 text-sm text-muted-foreground">
                {urlCount}/{MAX_URLS} URLs
              </p>
            </Field>
          </div>

          <DialogFooter>
            <Button type="submit" loading={addScraperUrlsAction.submitting}>
              Add URLs
            </Button>
          </DialogFooter>
        </addScraperUrlsAction.Form>
      </DialogContent>
    </Dialog>
  );
}
