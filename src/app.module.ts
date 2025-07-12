import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

const envFilePath = [`.env.${process.env.NODE_ENV || 'development'}`, '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3306),
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_KEY: Joi.string().required(),
        SUPABASE_JWT_SECRET: Joi.string().required(),
        UPSTASH_REDIS_REST_URL: Joi.string().required(),
        UPSTASH_REDIS_REST_TOKEN: Joi.string().required(),
      }),
    }),
    SupabaseModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}
