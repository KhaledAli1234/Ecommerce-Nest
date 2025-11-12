import { Global, Module } from '@nestjs/common';
import { TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DB';
import { TokenService } from 'src/commen';
import { JwtService } from '@nestjs/jwt';
import { createClient } from 'redis';
@Global()
@Module({
  imports: [UserModel, TokenModel],
  controllers: [],
  providers: [
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: 'redis://localhost:6379', // or your VPS URL
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
    },
  ],
  exports: [
    UserModel,
    TokenModel,
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
    'REDIS_CLIENT'
  ],
})
export class SharedAuthenticationModule {}
