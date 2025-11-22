import { IsString, IsEnum, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+212612345678' })
  @IsString()
  @Matches(/^\+212[5-7]\d{8}$/, { message: 'Format de téléphone invalide' })
  phone: string;

  @ApiProperty({ enum: ['registration', 'login', 'password_reset'] })
  @IsEnum(['registration', 'login', 'password_reset'])
  purpose: 'registration' | 'login' | 'password_reset';
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+212612345678' })
  @IsString()
  @Matches(/^\+212[5-7]\d{8}$/, { message: 'Format de téléphone invalide' })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Le code doit contenir 6 chiffres' })
  code: string;

  @ApiProperty({ enum: ['registration', 'login', 'password_reset'] })
  @IsEnum(['registration', 'login', 'password_reset'])
  purpose: 'registration' | 'login' | 'password_reset';
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @ApiProperty({ example: '+212612345678' })
  @IsString()
  @Matches(/^\+212[5-7]\d{8}$/, { message: 'Format de téléphone invalide' })
  phone: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({ example: 'Mohammed' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Alaoui' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: ['CLIENT', 'HELPER'] })
  @IsEnum(['CLIENT', 'HELPER'])
  role: 'CLIENT' | 'HELPER';

  @ApiProperty({ example: 'Casablanca' })
  @IsString()
  @IsNotEmpty()
  city: string;
}

export class LoginDto {
  @ApiProperty({ example: '+212612345678' })
  @IsString()
  @Matches(/^\+212[5-7]\d{8}$/, { message: 'Format de téléphone invalide' })
  phone: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
