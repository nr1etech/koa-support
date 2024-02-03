import {Context, Next} from 'koa';
import * as logging from '@nr1e/logging';
import {HttpMethod} from '@nr1e/commons/http';
import crypto from 'crypto';

const log = logging.getLogger('etag');

export type HashType = 'sha1' | 'md5';
export type Encoding = 'base64' | 'base64url' | 'hex';

export interface EtagOptions {
  readonly hashType?: HashType;
  readonly encoding?: Encoding;
}

export interface EtagMiddlewareOptions extends EtagOptions {
  readonly hashType?: HashType;
}

export function etag(
  options?: EtagMiddlewareOptions
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next) => {
    await next();
    if (
      (ctx.request.method === HttpMethod.GET ||
        ctx.request.method === HttpMethod.HEAD) &&
      ctx.body !== undefined &&
      ctx.body !== null
    ) {
      if (typeof ctx.body === 'string') {
        ctx.etag = crypto
          .createHash(options?.hashType ?? 'md5')
          .update(ctx.body)
          .digest(options?.encoding ?? 'base64url');
      } else {
        log
          .warn()
          .msg(
            'Etag middleware only supports string bodies and is meant to be used with stringifyResponse middleware'
          );
      }
    }
  };
}
