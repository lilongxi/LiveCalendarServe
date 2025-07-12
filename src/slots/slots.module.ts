import { Module } from '@nestjs/common';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule], // 导入 SupabaseModule
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}
