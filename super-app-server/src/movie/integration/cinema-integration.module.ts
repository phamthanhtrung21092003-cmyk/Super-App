import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { CinemaIntegrationService } from './cinema-integration.service';
import { CgvAdapter } from './adapters/cgv.adapter';
import { LotteAdapter } from './adapters/lotte.adapter';
import { GalaxyAdapter } from './adapters/galaxy.adapter';
import { BetaAdapter } from './adapters/beta.adapter';
import { BhdAdapter } from './adapters/bhd.adapter';
import { CinestarAdapter } from './adapters/cinestar.adapter';
import { MockCinemaAdapter } from './adapters/mock-cinema.adapter';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    CinemaIntegrationService,
    CgvAdapter,
    LotteAdapter,
    GalaxyAdapter,
    BetaAdapter,
    BhdAdapter,
    CinestarAdapter,
    MockCinemaAdapter,
  ],
  exports: [
    CinemaIntegrationService,
    CgvAdapter,
    LotteAdapter,
    GalaxyAdapter,
    BetaAdapter,
    BhdAdapter,
    CinestarAdapter,
    MockCinemaAdapter,
  ],
})
export class CinemaIntegrationModule {}