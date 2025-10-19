import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tokenName } from 'src/commen/decorators';
import { TokenEnum } from 'src/commen/enums';
import { TokenService } from 'src/commen/services';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType: TokenEnum =
      this.reflector.getAllAndOverride<TokenEnum>(tokenName, [
        context.getClass(),
        context.getHandler(),
      ]) ?? TokenEnum.access;
    let req: any;
    let authorization: string = '';
    switch (context.getType()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;
        break;

      // case 'rpc':
      //   const RpcCtx = context.switchToRpc();
      //   break;

      // case 'ws':
      //   const WsCtx = context.switchToWs();
      //   break;

      default:
        break;
    }

    const { user, decoded } = await this.tokenService.decodedToken({
      authorization,
      tokenType,
    });
    req.credentials = { user, decoded };
    return true;
  }
}
