import {Context, Next} from 'koa';
import {isHttpError, isNotFoundError} from '@nr1e/commons/errors';
import {HttpStatusCode} from '@nr1e/commons/http';

export interface ErrorHandlerptions {
  readonly contentType?: string;
}

export function errorHandler(
  options?: ErrorHandlerptions
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
      if (ctx.status === HttpStatusCode.NOT_FOUND) {
        ctx.body = {
          message: typeof ctx.body === 'string' ? ctx.body : 'Not found',
        };
      }
      if (ctx.status === HttpStatusCode.METHOD_NOT_ALLOWED) {
        ctx.body = {
          message:
            typeof ctx.body === 'string' ? ctx.body : 'Method not allowed',
        };
      }
    } catch (err) {
      let msg = 'Internal Server Error';
      let status = HttpStatusCode.INTERNAL_SERVER_ERROR;
      if (err instanceof Error) {
        if (isHttpError(err)) {
          status = err.statusCode;
          msg =
            err.statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR
              ? 'Internal Server Error'
              : err.message;
        } else {
          status = HttpStatusCode.INTERNAL_SERVER_ERROR;
          msg = 'Internal Server Error';
        }
        if (isNotFoundError(err)) {
          ctx.set('cache-control', `public, max-age=${err.maxAge}`);
        }
      }
      ctx.status = status;
      ctx.body = {message: msg};
      if (options?.contentType) {
        ctx.set('content-type', options.contentType);
      }
      ctx.app.emit('error', err, ctx);
    }
  };
}
