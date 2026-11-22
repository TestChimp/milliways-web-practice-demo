import testchimp from '@testchimp/rum-js';

/**
 * TrueCoverage (TestChimp RUM) wiring.
 *
 * Credentials are read at runtime from /rum-config.json (gitignored; see public/rum-config.example.json)
 * so the project API key never lands in the repo. When the file is missing, RUM is off and emits are no-ops.
 *
 * Environment tag: rum-config.json `environment` (default "QA", matching SmartTests TESTCHIMP_ENV=QA).
 * Real-user traffic can override it per browser with window.__MILLIWAYS_RUM_ENV (e.g. "production").
 */
interface RumConfig {
  projectId: string;
  apiKey: string;
  environment?: string;
  release?: string;
  endpoint?: string;
}

type Primitive = string | number | boolean;

let enabled = false;

export async function initRum(): Promise<void> {
  try {
    const res = await fetch('/rum-config.json', { cache: 'no-store' });
    if (!res.ok) return;
    const cfg = (await res.json()) as RumConfig;
    if (!cfg.projectId || !cfg.apiKey) return;
    const override = (globalThis as { __MILLIWAYS_RUM_ENV?: string }).__MILLIWAYS_RUM_ENV;
    testchimp.init({
      projectId: cfg.projectId,
      apiKey: cfg.apiKey,
      environment: override ?? cfg.environment ?? 'QA',
      release: cfg.release ?? '1.0.0',
      branchName: 'main',
      config: {
        maxEventsPerSession: 200,
        maxRepeatsPerEvent: 20,
        eventSendInterval: 5000,
        ...(cfg.endpoint ? { testchimpEndpoint: cfg.endpoint } : {}),
      },
    });
    enabled = true;
  } catch {
    enabled = false;
  }
}

/** Emits a journey event. Titles are kebab-case and documented in plans/events/<title>.event.md. */
export function emitProductEvent(title: string, metadata?: Record<string, Primitive>): void {
  if (!enabled) return;
  testchimp.emit(metadata ? { title, metadata } : { title });
}

export function quantityBucket(q: number): string {
  if (q <= 1) return '1';
  if (q <= 3) return '2-3';
  return '4+';
}

export function countBucket(n: number): string {
  if (n === 0) return '0';
  if (n === 1) return '1';
  if (n <= 5) return '2-5';
  return '6+';
}
