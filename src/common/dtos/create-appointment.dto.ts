import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsUUID()
  slot_id: string;

  @IsNotEmpty()
  @IsString()
  founder_name: string;
}
