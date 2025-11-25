import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { UserDto } from './user.dto';

export class LoginResponseDto {
  @IsString()
  message: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsObject()
  @Type(() => UserDto)
  user: UserDto;
}
