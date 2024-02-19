import Router from '@koa/router';
import {Logger, getLogger} from '@nr1e/logging';
import {Context} from 'koa';

export abstract class Controller {
  protected getLogger(ctx: Context, name: string): Logger {
    return getLogger(name, ctx.logger);
  }

  abstract registerRoutes(router: Router): void;
}
