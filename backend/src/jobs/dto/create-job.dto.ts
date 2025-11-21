import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { JOB_NAMES } from '../../constants';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(Object.values(JOB_NAMES), {
    message: `jobName must be one of: ${Object.values(JOB_NAMES).join(', ')}`,
  })
  jobName: string;
}
