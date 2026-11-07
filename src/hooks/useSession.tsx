import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type ReactElement,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isSessionExpired } from '../lib/rules/session';

interface SessionContext {
  session: Session | null;
  loading: boolean;
}

const Ctx = createContext<SessionContext>({ session: null, loading: true });

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s && !isSessionExpired(s) ? s : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s && !isSessionExpired(s) ? s : null);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ session, loading }}>{children}</Ctx.Provider>;
}

export function useSession(): SessionContext {
  return useContext(Ctx);
}
