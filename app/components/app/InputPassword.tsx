import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Input, InputProps } from '~/components/ui/input';

const InputPassword = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={showPassword ? 'text' : 'password'} ref={ref} />

      <Button
        variant={'link'}
        size="icon"
        className="absolute right-0 top-0"
        onClick={() => setShowPassword(!showPassword)}
        type="button"
      >
        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </Button>
    </div>
  );
});
InputPassword.displayName = 'InputPassword';

export { InputPassword };
