import {Context, Next} from 'koa';
import {
  getLogger,
  getRootLogger,
  Logger,
  Level,
  Context as LoggerContext,
} from '@nr1e/logging';

/**
 * Options available to configure loggerContext.
 */
export interface LoggerContextOptions {
  /**
   * The base logger to create children from. If not set, the root logger is used.
   */
  readonly baseLogger?: Logger;

  /**
   * The name given to any child logger. If not specified, the name used is "Logger".
   */
  readonly loggerName?: string;

  /**
   * The level to set on the created logger. If not specified, the parent logging level is used.
   */
  readonly level?: Level;

  /**
   * Additional properties to add to the context of the created logger.
   */
  readonly context?: LoggerContext;
}

/**
 * Adds a logger to the context and adds initial context elements to the logger
 * following the NR1E logging standard.
 *
 * @param options configuration options
 */
export function loggerContext(
  options?: LoggerContextOptions
): (ctx: Context, next: Next) => Promise<void> {
  let baseLogger = options?.baseLogger;
  return async (ctx: Context, next: Next): Promise<void> => {
    if (!baseLogger) {
      baseLogger = getRootLogger();
    }
    const logger = getLogger(options?.loggerName ?? 'Logger', baseLogger);
    if (options?.level) {
      logger.level(options.level);
    }
    logger.ctx({
      ip: ctx.request.ip,
      ...options?.context,
    });
    ctx.logger = logger;
    await next();
  };
}
