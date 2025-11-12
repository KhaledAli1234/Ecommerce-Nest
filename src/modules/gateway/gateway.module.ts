import { Module } from '@nestjs/common';
import { RealTimeGateway } from './gateway';

@Module({
  providers: [RealTimeGateway],
})
export class RealTimeModule {}
