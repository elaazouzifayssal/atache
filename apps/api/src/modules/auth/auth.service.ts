import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const { phone, purpose } = dto;

    // Check if user exists for registration
    if (purpose === 'registration') {
      const existingUser = await this.prisma.user.findUnique({ where: { phone } });
      if (existingUser) {
        throw new ConflictException('Ce numéro de téléphone est déjà enregistré');
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES') || 5;

    // Save OTP to database
    await this.prisma.otpCode.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      },
    });

    // TODO: Send SMS via Infobip
    console.log(`OTP for ${phone}: ${code}`); // Remove in production

    return { message: 'OTP envoyé', expiresIn: expiryMinutes * 60 };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, code, purpose } = dto;

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Code OTP expiré ou invalide');
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw new BadRequestException('Nombre maximum de tentatives atteint');
    }

    if (otpRecord.code !== code) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Code OTP incorrect');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // Generate temporary verification token
    const verificationToken = this.jwtService.sign(
      { phone, purpose, verified: true },
      { expiresIn: '10m' }
    );

    return { verified: true, token: verificationToken };
  }

  async register(dto: RegisterDto) {
    // Verify the verification token
    try {
      const payload = this.jwtService.verify(dto.verificationToken);
      if (!payload.verified || payload.phone !== dto.phone) {
        throw new UnauthorizedException('Token de vérification invalide');
      }
    } catch {
      throw new UnauthorizedException('Token de vérification invalide ou expiré');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingUser) {
      throw new ConflictException('Ce numéro de téléphone est déjà enregistré');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        city: dto.city,
        phoneVerified: true,
        status: 'ACTIVE',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const tokens = await this.generateTokens(payload.sub);
      return tokens;
    } catch {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
        }
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
