import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { JOB_NAMES } from '../../constants';

export class UpdateScheduleDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(Object.values(JOB_NAMES))
  jobName: string;

  @IsNotEmpty()
  @IsString()
  cronExpression: string;

  @IsString()
  description: string;
}
