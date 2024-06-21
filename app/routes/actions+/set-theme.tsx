import { ActionFunctionArgs } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { createThemeAction } from 'remix-themes';

import { themeSessionResolver } from '~/lib/sessions.server';

export const setThemeActionPath = $path('/actions/set-theme');

export async function action(args: ActionFunctionArgs) {
  const themeAction = createThemeAction(themeSessionResolver);

  return themeAction({ ...args });
}

export type SetThemeActionType = typeof action;
