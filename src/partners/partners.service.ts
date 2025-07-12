import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 } from 'uuid';
import { CreatePartnerDto } from 'src/common/dtos/create-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const { name } = createPartnerDto;
    const share_link_id = v4(); // 生成唯一的分享链接ID

    const { data, error } = await this.supabaseService
      .getClient()
      .from('partners')
      .insert([{ name, share_link_id }])
      .select()
      .single();

    if (error) {
      // 在实际生产中，您可能需要更精细地处理错误，例如，如果 share_link_id 冲突，则重试
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('partners')
      .select('*');

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findByShareLinkId(share_link_id: string) {
    // 1. 根据 share_link_id 查找合伙人
    const { data: partner, error: partnerError } = await this.supabaseService
      .getClient()
      .from('partners')
      .select('id, name')
      .eq('share_link_id', share_link_id)
      .single();

    if (partnerError || !partner) {
      throw new NotFoundException(
        `Partner with share_link_id "${share_link_id}" not found`,
      );
    }

    // 2. 计算未来7天的时间范围
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    // 3. 查询该合伙人未来7天内所有可用的时间段
    const { data: available_slots, error: slotsError } =
      await this.supabaseService
        .getClient()
        .from('available_slots')
        .select('*')
        .eq('partner_id', partner.id)
        .eq('is_active', true)
        .eq('is_appointment', false)
        .gte('start_time', now.toISOString())
        .lte('start_time', sevenDaysLater.toISOString())
        .order('start_time', { ascending: true });

    if (slotsError) {
      throw new InternalServerErrorException(slotsError.message);
    }

    // 4. 返回组合数据
    return { partner, available_slots };
  }

  async findOneById(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Partner with ID "${id}" not found.`);
      }
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
