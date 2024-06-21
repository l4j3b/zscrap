import { getFormProps, getInputProps, getSelectProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Form } from '@remix-run/react';
import { capitalize } from 'lodash-es';
import { useRef } from 'react';
import { toast } from 'sonner';

import { OrganizationRoles } from 'drizzle/schema';
import { Field, FieldError } from '~/components/app/Field';
import { SelectWrapper } from '~/components/app/SelectWrapper';

import { useUpdateUserRoleAction } from '../../_actions+/update-user-role';

export function UserRoleSelect({ userId, role }: { userId: string; role: OrganizationRoles }) {
  const updateUserRole = useUpdateUserRoleAction();
  const $submitRef = useRef<HTMLButtonElement>(null);

  const [form, fields] = useForm({
    constraint: getZodConstraint(updateUserRole.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateUserRole.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      const result = await updateUserRole.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
        form.reset();
      } else {
        toast.success('User role updated.');
      }
    },
  });

  if (role === OrganizationRoles.Owner) {
    return capitalize(OrganizationRoles.Owner);
  }

  return (
    <Form {...getFormProps(form)} className="min-w-32">
      <input {...getInputProps(fields.userId, { type: 'hidden' })} value={userId} />

      <Field>
        <SelectWrapper
          {...getSelectProps(fields.role)}
          className="w-full"
          placeholder="Role"
          loading={updateUserRole.submitting}
          defaultValue={role}
          items={[
            {
              name: capitalize(OrganizationRoles.Admin),
              value: OrganizationRoles.Admin,
            },
            {
              name: capitalize(OrganizationRoles.Member),
              value: OrganizationRoles.Member,
            },
          ]}
          onValueChange={() => {
            $submitRef.current?.click();
          }}
        />

        <FieldError>{fields.role.errors}</FieldError>
      </Field>

      <button type="submit" className="hidden" ref={$submitRef} />
    </Form>
  );
}
