import {isObject} from '@nr1e/commons/lang';
import {Context, Next} from 'koa';

/**
 * Options for the stringifyResponseMiddleware.
 */
export interface StringifyResponseOptions {
  /**
   * Whether to pretty print the JSON response. Default is false.
   *
   * @default false
   */
  readonly prettyPrint?: boolean;
}

/**
 * Middleware that will turn response objects to JSON maintaining the content-type header if set to a JSON type.
 *
 * @param options
 */
export function stringifyResponse(
  options?: StringifyResponseOptions
): (ctx: Context, next: Next) => Promise<void> {
  const prettyPrint = options?.prettyPrint ?? false;
  return async (ctx: Context, next: Next) => {
    await next();
    if (isObject(ctx.body)) {
      ctx.body = prettyPrint
        ? JSON.stringify(ctx.body, null, 2)
        : JSON.stringify(ctx.body);
    }
  };
}
