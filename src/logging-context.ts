import {Context, Next} from 'koa';
import {getLogger, Level, Context as LoggerContext} from '@nr1e/logging';
import * as logging from '@nr1e/logging';

/**
 * Options available to configure loggerContext.
 */
export interface LoggingContextOptions {
  /**
   * The service name to use when initializing the root logger.
   */
  readonly svc: string;

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
export function loggingContext(
  options: LoggingContextOptions
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    if (!logging.isInitialized()) {
      ctx.logger = await logging.initialize({
        svc: options.svc,
        level: options.level,
      });
    }
    if (options.loggerName) {
      const logger = getLogger(options.loggerName ?? 'Logger');
      if (options?.level) {
        logger.level(options.level);
      }
      logger.ctx({
        ip: ctx.request.ip,
        ...options?.context,
      });
      ctx.logger = logger;
    }
    await next();
  };
}
