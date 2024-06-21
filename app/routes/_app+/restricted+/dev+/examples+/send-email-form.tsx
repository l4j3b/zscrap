import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod, getZodConstraint } from '@conform-to/zod';
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { z } from 'zod';

import { EmailTemplate } from '~/components/emails/EmailTemplate';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

const schema = z.object({
  email: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string({ required_error: 'Email is required' }).email('Email is invalid'),
  ),
  firstName: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string({ required_error: 'Message is required' })
      .min(2, 'First name is too short')
      .max(20, 'First name is too long'),
  ),
});

export default function Route() {
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state === 'submitting';

  const [form, fields] = useForm({
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Send email form</CardTitle>
          <CardDescription>
            This example demonstrates:
            <ul className="list-inside list-disc">
              <li>How to send an email using the Resend email service.</li>
              <li>How to use email templates.</li>
              <li>How to use the fetcher hook to send a POST request.</li>
              <li>Toast usage.</li>
              <li>Validation with zod/conform.</li>
            </ul>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <fetcher.Form method="post" className="max-w-72 space-y-4" {...getFormProps(form)}>
            <div className="w-fit min-w-72 space-y-2">
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input {...getInputProps(fields.email, { type: 'email' })} />
              <div id={fields.email.errorId}>{fields.email.errors}</div>
            </div>

            <div className="w-fit min-w-72 space-y-2">
              <Label htmlFor={fields.firstName.id}>First name</Label>
              <Input {...getInputProps(fields.firstName, { type: 'text' })} />
              <div id={fields.firstName.errorId}>{fields.firstName.errors}</div>
            </div>

            <Button type="submit" loading={isSubmitting}>
              Send email
            </Button>
          </fetcher.Form>

          <div className="mt-8">
            {fetcher?.data && (
              <pre className="mt-4 text-sm text-gray-500">
                {JSON.stringify(fetcher.data, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { email, firstName } = submission.value;

  const { data, error } = await context.resend.emails.send({
    from: 'j3b <contact@l4j3b.com>',
    to: [email],
    subject: 'Hello world',
    react: EmailTemplate({ firstName }),
  });

  if (error) {
    context.flashMessage('errorMessage', `Failed to send the message. Please try again later.`);

    return json(submission.reply());
  }

  context.flashMessage('successMessage', `Email sent successfully!`);

  return json({ ...submission.reply(), data });
}
