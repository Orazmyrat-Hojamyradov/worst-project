import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UniversityModule } from './university/university.module';
import { UsersModule } from './user/user.module';
import { UsersService } from './user/user.service';
import { AdminModule } from './admin/admin.module';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { RatingModule } from './rating/rating.module';
import { RankingController } from './ranking/ranking.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(config.get<string>('DATABASE_PORT', '5432'), 10),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'try-universe'),
        autoLoadEntities: true,
        synchronize: true, // set false in production and use migrations
      }),
      inject: [ConfigService]
    }),
    MulterModule.register({
      dest: join(__dirname, '..', 'uploads'), // files go to /uploads
    }),
    UsersModule,
    AuthModule,
    UniversityModule,
    AdminModule,
    RatingModule,
  ],
  controllers: [RankingController],
})

export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.usersService.seedAdmin();
  }
}
