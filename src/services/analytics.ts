type AnalyticsModule = {
  default: () => {
    logEvent: (name: string, params?: Record<string, unknown>) => Promise<void>;
    setUserId: (id: string | null) => Promise<void>;
  };
};

let mod: AnalyticsModule | null = null;

function load(): AnalyticsModule | null {
  if (mod) return mod;
  try {
    mod = require('@react-native-firebase/analytics') as AnalyticsModule;
    return mod;
  } catch {
    return null;
  }
}

export async function logEvent(name: string, params?: Record<string, unknown>): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.default().logEvent(name, params);
  } catch (e) {
    // eslint-disable-next-line no-console
    if (__DEV__) console.warn('[analytics] logEvent failed', name, e);
  }
}

export async function setUserId(id: string | null): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.default().setUserId(id);
  } catch {
    /* noop */
  }
}
