import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from 'src/commen/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const accessRoles: RoleEnum[] =
      this.reflector.getAllAndOverride<RoleEnum[]>('roles', [
        context.getClass(),
        context.getHandler(),
      ]) ?? [];
    let role: RoleEnum = RoleEnum.user;
    switch (context.getType()) {
      case 'http':
        role = context.switchToHttp().getRequest().credentials.user.role;
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
    return accessRoles.includes(role);
  }
}
