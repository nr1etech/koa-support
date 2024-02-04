import {initLambda} from './app-factory';
import {ParameterizedContext} from 'koa';

test('Test init()', async () => {
  initLambda({
    loggingOptions: {
      svc: 'some-handler',
    },
    routesFn: router => {
      router.get('/health', (ctx: ParameterizedContext) => {
        ctx.body = {status: 'ok'};
      });
    },
  });
});
