/* eslint-disable prefer-const */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateAppointmentDto } from 'src/common/dtos/create-appointment.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AppointmentsService {
  private supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { slot_id, founder_name } = createAppointmentDto;

    console.log(slot_id, founder_name);

    // 1. 验证 slot_id 是否有效且可用
    const { data: slot, error: slotError } = await this.supabase
      .from('available_slots')
      .select('id, partner_id, start_time, is_appointment, is_active')
      .eq('id', slot_id)
      .single();

    console.log(slot, slotError);

    if (slotError || !slot) {
      throw new NotFoundException(`Slot with ID ${slot_id} not found.`);
    }

    if (slot.is_appointment) {
      throw new BadRequestException('This slot has already been booked.');
    }

    if (!slot.is_active) {
      throw new BadRequestException('This slot is no longer available.');
    }

    // 2. 查找或创建 founder
    let { data: founder, error: founderFindError } = await this.supabase
      .from('founders')
      .select('id')
      .eq('name', founder_name)
      .single();

    console.log(founder);

    if (founderFindError && founderFindError.code !== 'PGRST116') {
      throw new BadRequestException('Error finding founder.');
    }

    if (!founder) {
      const { data: newFounder, error: founderCreateError } =
        await this.supabase
          .from('founders')
          .insert({ name: founder_name })
          .select('id')
          .single();

      if (founderCreateError) {
        throw new BadRequestException('Could not create founder.');
      }
      founder = newFounder;
    }

    const founder_id = founder.id;

    // 3. 检查创业者当天是否已经预约过该合伙人
    const appointmentDate = new Date(slot.start_time)
      .toISOString()
      .split('T')[0];

    const { data: existingAppointments, error: existingAppointmentsError } =
      await this.supabase
        .from('appointments')
        .select('id, available_slots(partner_id)')
        .eq('founder_id', founder_id)
        .eq('available_slots.partner_id', slot.partner_id)
        .gte('available_slots.start_time', `${appointmentDate}T00:00:00Z`)
        .lt('available_slots.start_time', `${appointmentDate}T23:59:59Z`);

    if (existingAppointmentsError) {
      console.error(
        'Error checking for existing appointments:',
        existingAppointmentsError,
      );
      throw new BadRequestException('Could not verify existing appointments.');
    }

    if (existingAppointments && existingAppointments.length > 0) {
      throw new BadRequestException(
        'Founder has already booked an appointment with this partner today.',
      );
    }

    // 4. 创建新的 appointment
    const { data: newAppointment, error: appointmentError } =
      await this.supabase
        .from('appointments')
        .insert({ slot_id, founder_id })
        .select()
        .single();

    if (appointmentError) {
      throw new BadRequestException('Could not create appointment.');
    }

    // 5. 更新 available_slots 表
    const { error: updateSlotError } = await this.supabase
      .from('available_slots')
      .update({ is_appointment: true })
      .eq('id', slot_id);

    if (updateSlotError) {
      console.error(
        'Failed to update slot status after booking:',
        updateSlotError,
      );
      throw new BadRequestException(
        'Appointment created, but failed to update slot status.',
      );
    }

    return newAppointment;
  }

  async cancel(appointment_id: string) {
    // 1. 验证 appointment_id 是否存在
    const { data: appointment, error: findError } = await this.supabase
      .from('appointments')
      .select('id, canceled_at')
      .eq('id', appointment_id)
      .single();

    if (findError || !appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointment_id} not found.`,
      );
    }

    // 2. 检查是否已经被取消
    if (appointment.canceled_at) {
      throw new BadRequestException(
        'This appointment has already been canceled.',
      );
    }

    // 3. 更新 canceled_at 字段
    const { data: updatedAppointment, error: cancelError } = await this.supabase
      .from('appointments')
      .update({ canceled_at: new Date().toISOString() })
      .eq('id', appointment_id)
      .select()
      .single();

    if (cancelError) {
      throw new BadRequestException('Could not cancel the appointment.');
    }

    return updatedAppointment;
  }
}
