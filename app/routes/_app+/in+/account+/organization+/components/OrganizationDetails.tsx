import { getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

import { OrganizationRoles } from 'drizzle/schema';
import { BuyCreditsButton } from '~/components/app/BuyCreditsButton';
import { Field, FieldError } from '~/components/app/Field';
import { InputConform } from '~/components/conform/Input';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { useActiveOrg } from '~/routes/_app+/_layout';

import { useUpdateOrgAction } from '../_actions+/update-org';

export function OrganizationDetails() {
  const $form = useRef<HTMLFormElement>(null);
  const { activeOrg: organization, loading } = useActiveOrg();
  const [isEditing, setIsEditing] = useState(false);
  const updateOrg = useUpdateOrgAction();

  const [form, fields] = useForm({
    id: `edit-organization_${organization?.organization.name}`,
    constraint: getZodConstraint(updateOrg.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      name: organization?.organization.name,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateOrg.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      (e.target as HTMLFormElement).querySelector('input')?.blur();
      const result = await updateOrg.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Organization updated successfully.');
        setIsEditing(false);
      }
    },
  });

  return (
    <updateOrg.Form
      ref={$form}
      {...getFormProps(form)}
      onChange={() => {
        setIsEditing(true);
      }}
    >
      <Card>
        <CardHeader className="flex-row items-center">
          <CardTitle>Settings</CardTitle>

          <div
            className="flex flex-row items-center space-x-2 transition-opacity"
            style={{
              opacity: isEditing ? 1 : 0,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              disabled={updateOrg.submitting}
              onClick={() => {
                $form.current?.reset();
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>

            <Button type="submit" loading={updateOrg.submitting}>
              Save
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex h-8 w-fit min-w-72 items-center space-x-2">
              <Label>Credits: </Label>

              <BuyCreditsButton numCredits={organization?.organization.apiCredits} />
            </div>

            <Field className="w-fit min-w-72">
              <Label htmlFor={fields.name.id} defaultValue={organization?.organization.name}>
                Name
              </Label>
              <InputConform
                loading={loading}
                disabled={organization?.role === OrganizationRoles.Member}
                meta={fields.name}
                type="text"
              />
              <FieldError>{fields.name.errors}</FieldError>
            </Field>
          </div>
        </CardContent>
      </Card>
    </updateOrg.Form>
  );
}
