import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
}
