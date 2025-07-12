import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSlotDto } from '../common/dtos/create-slot.dto';

@Injectable()
export class SlotsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createSlotDto: CreateSlotDto) {
    const { start_time, partner_id } = createSlotDto;
    const startTime = new Date(start_time);

    // 1. 验证 partner_id 是否存在
    const { data: partner, error: partnerError } = await this.supabaseService
      .getClient()
      .from('partners')
      .select('id')
      .eq('id', partner_id)
      .single();

    if (partnerError || !partner) {
      throw new NotFoundException(`Partner with ID "${partner_id}" not found.`);
    }

    // 2. 验证时间是否为15分钟的倍数
    if (
      startTime.getMinutes() % 15 !== 0 ||
      startTime.getSeconds() !== 0 ||
      startTime.getMilliseconds() !== 0
    ) {
      throw new BadRequestException(
        'Start time must be in 15-minute intervals.',
      );
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('available_slots')
      .insert([{ partner_id, start_time }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'This time slot has already been marked as available.',
        );
      }
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async remove(id: string) {
    // 1. 检查 slot 是否已被预约
    const { data: appointment, error: appointmentError } =
      await this.supabaseService
        .getClient()
        .from('appointments')
        .select('id')
        .eq('slot_id', id)
        .single();

    if (appointmentError && appointmentError.code !== 'PGRST116') {
      // PGRST116 aui 'Exact one row not found'
      throw new InternalServerErrorException(appointmentError.message);
    }

    if (appointment) {
      throw new BadRequestException(
        'This slot has been booked and cannot be deleted.',
      );
    }

    // 2. 将可用的 slot 标记为 is_active = false
    const { data, error } = await this.supabaseService
      .getClient()
      .from('available_slots')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException(`Slot with ID "${id}" not found.`);
    }

    return { message: 'Slot cancelled successfully.' };
  }

  async findAll(partner_id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('available_slots')
      .select('*')
      .eq('partner_id', partner_id);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
