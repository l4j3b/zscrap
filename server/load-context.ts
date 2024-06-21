import { Session } from '@remix-run/cloudflare';
import { Resend } from 'resend';
import type { PlatformProxy } from 'wrangler';

import { createSupabaseServerClient } from '~/lib/supabase.server';

import { initializeDbClient } from '../app/lib/db.server/initialize-db-client';

import { SessionData, SessionFlashData } from './sessions';

type Cloudflare = Omit<PlatformProxy<Env>, 'dispose'>;

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    session: Session<SessionData, SessionFlashData>;
    // supabaseUser: User | null;
    db: Awaited<ReturnType<typeof initializeDbClient>>;
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
    resend: Resend;

    /**
     * The user id of the current user if authenticated
     */
    sessionUserId: string;
    /**
     * Get the current session
     *
     * If the user is not logged it will throw an error
     *
     * @returns The session
     */
    getSession(): SessionData['auth'];
    /**
     * Set the session to the session storage
     *
     * It will then be automatically handled by the session middleware
     *
     * @param session - The auth session to commit
     */
    setSession(_session: SessionData['auth']): void;
    /**
     * Destroy the session from the session storage middleware
     *
     * It will then be automatically handled by the session middleware
     */
    destroySession(): void;
    /**
     * The flash message related to session
     */
    readFlashMessage: (_key: keyof SessionFlashData) => { message: string; id: number } | null;
    flashMessage: (_key: keyof SessionFlashData, _message: string) => void;
  }
}
