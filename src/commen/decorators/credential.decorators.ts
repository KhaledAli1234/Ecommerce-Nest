import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let req: any;
    switch (context.getType()) {
      case 'http':
        req = context.switchToHttp().getRequest().credentials.user;
        break;

      // case 'rpc':
      //   const RpcCtx = context.switchToRpc();
      //   break; 

      case 'ws':
        req = context.switchToWs().getClient().credentials.user;
        break;

      default:
        break;
    }
    return req.credentials.user;
  },
);
