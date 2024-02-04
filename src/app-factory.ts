import Application from 'koa';
import Router from '@koa/router';
import {default as cors} from '@koa/cors';
import {bodyParser} from '@koa/bodyparser';
import {errorLogger} from './error-logger';
import {errorHandler, ErrorHandlerptions} from './error-handler';
import {cacheControl} from './cache-control';
import {jwtAuthorizer, JwtAuthorizerOptions} from './jwt-authorizer';
import {etag} from './etag';
import {
  stringifyResponse,
  StringifyResponseOptions,
} from './stringify-response';
import {Options as CorsOptions} from '@koa/cors';
import {loggerContext, LoggerContextOptions} from './logger-context';
import * as logging from '@nr1e/logging';
import {default as Koa} from 'koa';

export type RoutesFn = (router: Router) => void;

export interface InitAppOptions {
  readonly loggingOptions: logging.LoggingConfig;
  readonly routesFn: RoutesFn;
  readonly loggerContextOptions?: LoggerContextOptions;
  readonly errorHandlerOptions?: ErrorHandlerptions;
  readonly jwtAuthorizerOptions?: JwtAuthorizerOptions;
  readonly corsOptions?: CorsOptions;
  readonly stringifyResponseOptions?: StringifyResponseOptions;
}

export async function init(options: InitAppOptions): Promise<Application> {
  await logging.initialize(options?.loggingOptions);
  const router = new Router();
  options.routesFn(router);
  const app = new Koa();
  app
    .use(loggerContext(options?.loggerContextOptions))
    .on('error', errorLogger())
    .use(errorHandler(options?.errorHandlerOptions))
    .use(
      cors({
        origin: options?.corsOptions?.origin ?? '*',
        allowHeaders: options?.corsOptions?.allowHeaders ?? '*',
        allowMethods: options?.corsOptions?.allowMethods ?? '*',
        credentials: options?.corsOptions?.credentials ?? true,
        maxAge: options?.corsOptions?.maxAge ?? 3600,
      })
    )
    .use(cacheControl());
  if (options?.jwtAuthorizerOptions) {
    app.use(jwtAuthorizer(options?.jwtAuthorizerOptions));
  }
  app
    .use(bodyParser())
    .use(etag())
    .use(stringifyResponse(options?.stringifyResponseOptions))
    .use(router.routes())
    .use(router.allowedMethods());
  return app;
}
