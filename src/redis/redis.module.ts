/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-20 14:15:11
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 14:19:59
 * @FilePath: /sbng_cake/shareholder_services/src/redis/redis.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
