import {init} from './app-factory';
import {ParameterizedContext} from 'koa';
import {default as serverless} from 'serverless-http';

test('Test init()', async () => {
  serverless(
    init({
      loggingOptions: {
        svc: 'some-handler',
      },
      routesFn: router => {
        router.get('/health', (ctx: ParameterizedContext) => {
          ctx.body = {status: 'ok'};
        });
      },
    })
  );
});
