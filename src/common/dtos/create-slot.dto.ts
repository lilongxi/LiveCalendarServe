import { IsISO8601, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty()
  @IsISO8601()
  start_time: string;

  @IsNotEmpty()
  @IsISO8601()
  end_time: string;

  @IsNotEmpty()
  @IsUUID()
  partner_id: string;
}
