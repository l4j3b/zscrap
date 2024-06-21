import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type MetaFunction } from '@remix-run/cloudflare';
import { Form, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Field, FieldError } from '~/components/app/Field';
import { Pre } from '~/components/app/Pre';
import { ProgressLoader } from '~/components/app/ProgressLoader';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { Textarea } from '~/components/ui/textarea';
import { config } from '~/config';
import { useConfirmDialog } from '~/lib/hooks/use-confirm-dialog';
import { cn } from '~/lib/utils';

import { useCreateScraperAction } from '../scrapers+/actions+/create';

import { useProcessUrlAction } from './actions+/process-url';

export const meta: MetaFunction = () => {
  return [{ title: `Scrapers - ${config.app.name}` }];
};

const DEFAULT_URL = 'https://www.youtube.com/watch?v=w4LRUBFy3pc&t=6516s';
const DEFAULT_PROMPT = `Extract the tracklist of the video if available.`;

const DEFAULT_JSON_SCHEMA = `{
 tracks: [
  {
    timestamp: "Timestamp if available",
    track: "Track name",
  }
 ]
}`;

const PROGRESS_STEPS = [
  {
    id: 'initializing',
    text: 'Initializing...',
    value: 0,
    time: 3000,
  },
  {
    id: 'scraping',
    text: 'Retrieving URL content...',
    value: 10,
    time: 6000,
  },
  {
    id: 'scraping1',
    text: 'Retrieving URL content...',
    value: 25,
    time: 9000,
  },
  {
    id: 'scraping1',
    text: 'Retrieving URL content...',
    value: 35,
    time: 12000,
  },
  {
    id: 'analyzing',
    text: 'Analyzing...',
    value: 50,
    time: 18000,
  },
  {
    id: 'analyzing1',
    text: 'Analyzing...',
    value: 65,
    time: 22000,
  },
  {
    id: 'extracting',
    text: 'Analyzing...',
    value: 80,
    time: 30000,
  },
  {
    id: 'finalizing',
    text: 'Finalizing...',
    value: 90,
    time: 100000,
  },
];

export default function NewScraper() {
  const [searchParams] = useSearchParams();
  const processUrl = useProcessUrlAction();
  const createScraper = useCreateScraperAction();
  const confirmDialog = useConfirmDialog();

  const populateFields = searchParams.get('test');
  const [jsonSchema, setJsonSchema] = useState(populateFields ? DEFAULT_JSON_SCHEMA : '');

  const [form, fields] = useForm({
    id: `process-url`,
    constraint: getZodConstraint(processUrl.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: processUrl.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      (e.target as HTMLFormElement).querySelector('input')?.blur();
      const result = await processUrl.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Processing done!');

        if (result?.jsonSchema) {
          setJsonSchema(result.jsonSchema);
        }
      }
    },
    defaultValue: populateFields
      ? {
          name: null,
          url: DEFAULT_URL,
          prompt: DEFAULT_PROMPT,
        }
      : undefined,
  });

  return (
    <>
      <ProgressLoader loading={processUrl.loading} steps={PROGRESS_STEPS} background />

      <Section>
        <SectionHeader className="justify-between">
          <SectionTitle>NEW SCRAPER</SectionTitle>
        </SectionHeader>

        <SectionContent>
          <div className={cn(`grid grid-cols-12 gap-4`)}>
            <Card className="col-span-5">
              <CardContent>
                <Form {...getFormProps(form)} className="h-full">
                  <Field className="w-full min-w-72">
                    <Label htmlFor={fields.name.id}>Name</Label>
                    <Input
                      placeholder="Name of your scraper"
                      {...getInputProps(fields.name, { type: 'text' })}
                    />
                    <FieldError>{fields.name.errors}</FieldError>
                  </Field>

                  <Field className="mt-6 w-full min-w-72">
                    <Label htmlFor={fields.url.id}>URL</Label>
                    <Input
                      placeholder="URL used for testing"
                      {...getInputProps(fields.url, { type: 'text' })}
                    />
                    <FieldError>{fields.url.errors}</FieldError>
                  </Field>

                  <Field className="mt-6 w-full min-w-72">
                    <Label htmlFor={fields.prompt.id}>Instructions</Label>
                    <Textarea
                      placeholder={`Tell the scraper what you would like to retrieve.

Example for a YouTube video:
"Extract the title, description, the number of views and and tell me what the video is about (topic)."

Note: In that example, we have a computed field (topic). That field will be computed by the LLM, based on the content of the page.`}
                      {...getInputProps(fields.prompt, { type: 'text' })}
                      rows={8}
                    />
                    <FieldError>{fields.prompt.errors}</FieldError>
                  </Field>

                  <Field className="mt-6 w-full min-w-72">
                    <Label htmlFor={fields.jsonSchema.id}>JSON schema (optional)</Label>
                    <span className="text-sm text-muted-foreground">
                      We will suggest one for you if not provided. You can then refine it if needed.
                    </span>
                    <Textarea
                      placeholder={`Desired output JSON schema/structure.

Example for a YouTube video:
{
	'title': 'title of the page',
	'description': 'description of the page',
	'number_of_views': 'number of views of the page',
}`}
                      {...getInputProps(fields.jsonSchema, { type: 'text' })}
                      rows={8}
                      value={jsonSchema}
                      onChange={(e) => setJsonSchema(e.target.value)}
                    />
                    <FieldError>{fields.jsonSchema.errors}</FieldError>
                  </Field>

                  <div className="mt-6 flex justify-between gap-4">
                    <Button type="submit" variant="secondary" loading={processUrl.loading}>
                      Test
                    </Button>

                    <Button
                      loading={createScraper.loading}
                      disabled={!jsonSchema || !processUrl.data}
                      variant={!jsonSchema || !processUrl.data ? 'outline' : 'default'}
                      onClick={() => {
                        confirmDialog({
                          title: 'Create scraper',
                          description: 'Are you sure you want to create this scraper?',
                          okText: 'Create',
                          onConfirm: async () => {
                            if (
                              form.valid &&
                              fields.url.value &&
                              fields.prompt.value &&
                              fields.name.value &&
                              jsonSchema
                            ) {
                              await createScraper.submit({
                                name: fields.name.value,
                                prompt: fields.prompt.value,
                                jsonSchema: jsonSchema,
                              });
                            }
                          },
                        });
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>

            <Card className="col-span-7 border-none bg-transparent p-0">
              <CardContent>
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">{processUrl?.data?.title || 'URL title'}</h2>

                  <Pre className="w-full" nocopy title="JSON">
                    {JSON.stringify(processUrl?.data?.jsonResult, null, 2) ||
                      'The test output/result will be displayed here.'}
                  </Pre>

                  {/* <Pre className="w-full" nocopy title="JSON schema">
                    {processUrl?.data?.jsonSchema || 'The JSON schema will be displayed here'}
                  </Pre> */}

                  <Pre className="w-full" nocopy title="Suggestions">
                    {processUrl?.data?.suggestion || 'The LLM suggestions will be displayed here.'}
                  </Pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </SectionContent>
      </Section>
    </>
  );
}
