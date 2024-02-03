import {Context} from 'koa';
import {HttpStatusCode} from '@nr1e/commons/http';
import {Logger} from '@nr1e/logging';

export interface ErrorLoggerOptions {
  readonly errorCodes?: number[];
  readonly warnCodes?: number[];
  readonly infoCodes?: number[];
  readonly debugCodes?: number[];
  readonly traceCodes?: number[];
}

export function errorLogger(
  props?: ErrorLoggerOptions
): (err: Error, ctx: Context) => Promise<void> {
  return async (err: Error, ctx: Context) => {
    const log: Logger | undefined = ctx.logger;
    if (
      (props?.errorCodes ?? [HttpStatusCode.INTERNAL_SERVER_ERROR]).includes(
        ctx.status
      )
    ) {
      if (log) {
        log.error().err(err).msg('An error occurred');
      } else {
        console.error('An error occurred', err);
      }
      return;
    }
    if (props?.warnCodes?.includes(ctx.status)) {
      if (log) {
        log.warn().err(err).msg('An error occurred');
      } else {
        console.warn('An error occurred', err);
      }
      return;
    }
    if (
      (
        props?.infoCodes ?? [
          HttpStatusCode.FORBIDDEN,
          HttpStatusCode.BAD_REQUEST,
          HttpStatusCode.UNSUPPORTED_MEDIA_TYPE,
        ]
      ).includes(ctx.status)
    ) {
      if (log) {
        log.info().err(err).msg('An error occurred');
      } else {
        console.info('An error occurred', err);
      }
      return;
    }
    if (props?.debugCodes?.includes(ctx.status)) {
      if (log) {
        log.debug().err(err).msg('An error occurred');
      } else {
        console.debug('An error occurred', err);
      }
      return;
    }
    if (props?.traceCodes?.includes(ctx.status)) {
      if (log) {
        log.trace().err(err).msg('An error occurred');
      } else {
        console.trace('An error occurred', err);
      }
      return;
    }
  };
}
