import Router from '@koa/router';

export abstract class Controller {
  abstract registerRoutes(router: Router): void;
}
