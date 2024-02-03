import Application from 'koa';
import Router from '@koa/router';
const cors = require('@koa/cors');
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

const Koa = require('koa');

export interface InitAppOptions {
  readonly loggingOptions: logging.LoggingConfig;
  readonly loggerContextOptions?: LoggerContextOptions;
  readonly errorHandlerOptions?: ErrorHandlerptions;
  readonly jwtAuthorizerOptions?: JwtAuthorizerOptions;
  readonly corsOptions?: CorsOptions;
  readonly stringifyResponseOptions?: StringifyResponseOptions;
}

export async function init(
  options: InitAppOptions
): Promise<[Application, Router]> {
  await logging.initialize(options?.loggingOptions);
  const router = new Router();
  const app = Koa();
  app
    .use(loggerContext(options?.loggerContextOptions))
    .on('error', errorLogger())
    .use(errorHandler(options?.errorHandlerOptions))
    .use(
      cors({
        origin: options?.corsOptions?.origin ?? '*',
        headers: options?.corsOptions?.allowHeaders ?? '*',
        methods: options?.corsOptions?.allowMethods ?? '*',
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
  return [app, router];
}
