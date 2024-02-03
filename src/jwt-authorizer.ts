import {Context, Next} from 'koa';
import * as jose from 'jose';
import {getLogger} from '@nr1e/logging';

export interface JwtAuthorizerOptions {
  readonly jwksUrl: string;
  readonly scopes: string[];
  readonly claims?: string[];
  readonly audience: string;
  readonly issuer: string;
  readonly clockTolerance?: number;
  readonly getIdentity?: (
    payload: jose.JWTPayload
  ) => Promise<Object | undefined | null>;
}

function isExpired(payload: jose.JWTPayload) {
  if (payload.exp === undefined) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

function hasScopes(payload: jose.JWTPayload, scopes: string[]) {
  if (payload.scope && typeof payload.scope === 'string') {
    const pscopes = payload.scope.split(' ');
    return scopes.map(s => pscopes.includes(s)).reduce((s1, s2) => s1 && s2);
  }
  return false;
}

export function jwtAuthorizer(
  options: JwtAuthorizerOptions
): (ctx: Context, next: Next) => Promise<void> {
  return async (ctx: Context, next: Next) => {
    const log = getLogger('JwtAuthorizerMiddleware', ctx.logger);
    const authorization = ctx.request.headers['authorization'];
    if (
      authorization !== undefined &&
      authorization !== null &&
      authorization.startsWith('Bearer ')
    ) {
      const token = authorization.substring(7);
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      const jwks = jose.createRemoteJWKSet(new URL(options.jwksUrl));
      try {
        const result = await jose.jwtVerify(token, jwks, {
          audience: options.audience,
          clockTolerance: options.clockTolerance ?? 5,
          issuer: options.issuer,
          requiredClaims: options.claims ?? [],
        });
        if (isExpired(result.payload)) {
          log.debug().msg('Bearer token expired');
        } else if (!hasScopes(result.payload, options.scopes)) {
          log.debug().msg('Bearer token does not have required scopes');
        } else {
          log.debug().msg('Bearer token verified');
          if (options.getIdentity === undefined) {
            log.debug().msg('No getIdentity function');
            ctx.state.auth = result;
          } else {
            const identity = await options.getIdentity(result.payload);
            if (identity !== undefined && identity !== null) {
              log.debug().msg('Identity found');
              ctx.state.auth = result;
              ctx.state.authIdentity = identity;
            }
          }
        }
      } catch (err) {
        log.error().err(err).msg('Error verifying JWT');
      }
    } else {
      log.debug().msg('No authorization header');
    }
    await next();
  };
}
