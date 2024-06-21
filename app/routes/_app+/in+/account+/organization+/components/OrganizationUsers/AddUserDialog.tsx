import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Form } from '@remix-run/react';
import { capitalize } from 'lodash-es';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { OrganizationRoles } from 'drizzle/schema';
import { Field, FieldError } from '~/components/app/Field';
import { SelectConform } from '~/components/conform/Select';
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
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { useAddUserAction } from '../../_actions+/add-user';

export function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const addUser = useAddUserAction();

  const [form, fields] = useForm({
    constraint: getZodConstraint(addUser.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      role: OrganizationRoles.Member,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addUser.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      (e.target as HTMLFormElement).querySelector('input')?.blur();
      const result = await addUser.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsOpen(false);
        toast.success('User added.');
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
        <Button variant="outline">
          <Plus className="mr-2 size-5" />
          <span>Invite user</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-max">
        <Form {...getFormProps(form)}>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Enter the email address of the user to add.</DialogDescription>
          </DialogHeader>

          <div
            className={`
              mt-8 flex flex-col transition-all
              max-sm:space-y-4
              sm:flex-row sm:space-x-4
            `}
          >
            <Field className="min-w-72">
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input {...getInputProps(fields.email, { type: 'email' })} />
              <FieldError>{fields.email.errors}</FieldError>
            </Field>

            <Field>
              <Label htmlFor={fields.role.id}>Role</Label>
              <SelectConform
                className={`
                  transition-all
                  sm:w-[180px]
                `}
                meta={fields.role}
                placeholder="Role"
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
              />

              <FieldError>{fields.role.errors}</FieldError>
            </Field>
          </div>

          <DialogFooter>
            <Button type="submit" loading={addUser.submitting}>
              Add user
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
