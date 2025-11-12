import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { type RedisClientType } from 'redis';
import { Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { TTLNAME } from '../decorators';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const expires =
      this.reflector.getAllAndOverride<number>(TTLNAME, [
        context.getClass(),
        context.getHandler(),
      ]) ?? 0;
    const request = context.switchToHttp().getRequest();
    const key = `cache:${request.url}`;

    // check cache first
    const cached = await this.redis.get(key);
    if (cached) {
      console.log(`✅ Cache hit for ${key}`);
      return of(JSON.parse(cached)); // return cached data
    }

    // continue normally
    return next.handle().pipe(
      tap(async (data) => {
        // store response in cache with 10s expiry
        await this.redis.set(key, JSON.stringify(data), { EX: expires });
        console.log(`💾 Cache set for ${key}`);
      }),
    );
  }
}
