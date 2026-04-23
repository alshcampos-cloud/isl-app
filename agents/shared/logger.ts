/**
 * Structured Logger for the IAI Agent System.
 *
 * Writes to the `agent_logs` Supabase table and console.
 * Fire-and-forget: log calls return immediately and never block the caller.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AgentName, LogLevel, LogEntry } from './types';

// ── Supabase singleton ───────────────────────────────────────────────

const SUPABASE_URL = 'https://tzrlpwtkrtvjpdhcaayu.supabase.co';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Cannot initialize logger.'
    );
  }

  _supabase = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _supabase;
}

// ── Console formatting ───────────────────────────────────────────────

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: '\x1b[90m[DEBUG]\x1b[0m',
  info: '\x1b[36m[INFO]\x1b[0m',
  warn: '\x1b[33m[WARN]\x1b[0m',
  error: '\x1b[31m[ERROR]\x1b[0m',
  fatal: '\x1b[35m[FATAL]\x1b[0m',
};

function consoleLog(
  agent: AgentName,
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const prefix = `${timestamp} ${LEVEL_LABELS[level]} [${agent}]`;

  if (metadata && Object.keys(metadata).length > 0) {
    console.log(`${prefix} ${message}`, JSON.stringify(metadata));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ── Supabase insert (fire-and-forget) ────────────────────────────────

function writeToSupabase(entry: Omit<LogEntry, 'id' | 'created_at'>): void {
  try {
    const supabase = getSupabase();

    // Fire and forget — do not await
    supabase
      .from('agent_logs')
      .insert(entry)
      .then(({ error }) => {
        if (error) {
          // Fallback to console only — never throw from a logger
          console.error(
            `[logger] Failed to write to agent_logs: ${error.message}`
          );
        }
      });
  } catch (err) {
    // If Supabase client init fails, log to console only
    console.error(
      `[logger] Supabase unavailable: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ── Logger class ─────────────────────────────────────────────────────

export class Logger {
  private agent: AgentName;
  private sessionId: string | undefined;

  constructor(agent: AgentName, sessionId?: string) {
    this.agent = agent;
    this.sessionId = sessionId;
  }

  /** Set or update the session ID for grouping logs. */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    durationMs?: number
  ): void {
    // Always write to console
    consoleLog(this.agent, level, message, metadata);

    // Write to Supabase (fire-and-forget)
    writeToSupabase({
      agent: this.agent,
      level,
      message,
      metadata,
      duration_ms: durationMs,
      session_id: this.sessionId,
    });
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(
    message: string,
    metadata?: Record<string, unknown>,
    durationMs?: number
  ): void {
    this.log('info', message, metadata, durationMs);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(
    message: string,
    metadata?: Record<string, unknown>,
    durationMs?: number
  ): void {
    this.log('error', message, metadata, durationMs);
  }

  fatal(message: string, metadata?: Record<string, unknown>): void {
    this.log('fatal', message, metadata);
  }

  /**
   * Time an async operation. Logs start at debug level, completion at info,
   * and failure at error — all with duration_ms.
   */
  async timed<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = Date.now();
    this.debug(`Starting: ${label}`, metadata);

    try {
      const result = await fn();
      const durationMs = Date.now() - start;
      this.info(`Completed: ${label}`, metadata, durationMs);
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      this.error(
        `Failed: ${label} — ${errorMessage}`,
        { ...metadata, error: errorMessage },
        durationMs
      );
      throw err;
    }
  }
}

// ── Factory ──────────────────────────────────────────────────────────

/** Create a logger instance for a specific agent. */
export function createLogger(agent: AgentName, sessionId?: string): Logger {
  return new Logger(agent, sessionId);
}
