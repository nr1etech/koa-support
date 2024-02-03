import {Context, Next} from 'koa';
import {HttpMethod} from '@nr1e/commons/http';

/**
 * Options for CacheControlMiddleware.
 */
export type Scope = 'public' | 'private';

export interface CacheControlMiddlewareOptions {
  /**
   * If public, the response may be stored by any cache, even if the response is normally non-cacheable or cacheable only within a private cache.
   * If private, the response is specific to the user and should not be stored by shared caches.
   */
  readonly scope?: Scope;

  /**
   * Specifies the maximum amount of time a resource is considered fresh. After this time, the cache will revalidate the response.
   */
  readonly maxAge?: number;

  /**
   * Like max-age, but it only applies to shared caches.
   */
  readonly sMaxAge?: number;

  /**
   * If set to true, once a resource becomes stale, caches must not use their stale copy without successful validation on the origin server.
   */
  readonly mustRevalidate?: boolean;

  /**
   * If set to true, similar to must-revalidate, but it only applies to shared caches.
   */
  readonly proxyRevalidate?: boolean;

  /**
   * If set to true, the cache should not store the response. This prevents storing sensitive information
   */
  readonly noStore?: boolean;

  /**
   * .
   * If set to true, The cache must revalidate with the server every time before using a cached response.
   */
  readonly noCache?: boolean;

  /**
   * If set to true, the cache must not change the media type of the response.
   */
  readonly noTransform?: boolean;

  /**
   * If set to true, the response body will not change over time. The resource, if unexpired, is unchanged on the server and therefore the client should not send a conditional revalidation for it.
   */
  readonly immutable?: boolean;
}

export const PREVENT_CACHING: CacheControlMiddlewareOptions = {
  noCache: true,
  noStore: true,
  mustRevalidate: true,
  maxAge: 0,
};

function appendValue(current: string, addition: string): string {
  return current === '' ? addition : current + ', ' + addition;
}

export function cacheControl(
  options?: CacheControlMiddlewareOptions
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next): Promise<void> => {
    if (options === undefined) {
      options = PREVENT_CACHING;
    }
    await next();
    if (
      (ctx.request.method === HttpMethod.GET ||
        ctx.request.method === HttpMethod.HEAD) &&
      ctx.status === 200 &&
      ctx.body !== undefined &&
      ctx.body !== null &&
      ctx.response.headers['cache-control'] === undefined
    ) {
      let cacheControl = options.scope !== undefined ? options.scope : '';
      if (options.maxAge !== undefined) {
        cacheControl = appendValue(cacheControl, `max-age=${options.maxAge}`);
      }
      if (options.sMaxAge !== undefined) {
        cacheControl = appendValue(cacheControl, `s-maxage=${options.sMaxAge}`);
      }
      if (options.mustRevalidate) {
        cacheControl = appendValue(cacheControl, 'must-revalidate');
      }
      if (options.proxyRevalidate) {
        cacheControl = appendValue(cacheControl, 'proxy-revalidate');
      }
      if (options.noStore) {
        cacheControl = appendValue(cacheControl, 'no-store');
      }
      if (options.noCache) {
        cacheControl = appendValue(cacheControl, 'no-cache');
      }
      if (options.noTransform) {
        cacheControl = appendValue(cacheControl, 'no-transform');
      }
      if (options.immutable) {
        cacheControl = appendValue(cacheControl, 'immutable');
      }
      ctx.set('cache-control', cacheControl);
    }
  };
}
