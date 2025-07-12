import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty()
  @IsDateString()
  start_time: string;

  @IsNotEmpty()
  @IsUUID()
  partner_id: string;
}
