import { IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty()
  @IsISO8601()
  start_time: string;
}
