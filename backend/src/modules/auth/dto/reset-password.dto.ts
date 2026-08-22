import { IsString } from 'class-validator';
import { IsStrongPassword } from '../../security/validators/is-strong-password';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;
}
