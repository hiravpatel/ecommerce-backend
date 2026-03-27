import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MongoRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import type { SignOptions } from 'jsonwebtoken';
import {
  PasswordResetToken,
  RefreshToken,
} from '../../data/entities/refresh-token.entity';
import { ForgotPasswordDto } from '../../presentation/dto/forgot-password.dto';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { ResetPasswordDto } from '../../presentation/dto/reset-password.dto';
import { User, UserRole } from 'src/modules/users/data/entities/user.entity';
import { Vendor } from 'src/modules/vendors/data/entities/vendor.entity';
import { objectIdToString } from 'src/common/database/object-id.util';
import { slugify } from 'src/common/utils/slug.util';

type RequestContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: MongoRepository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokensRepository: MongoRepository<PasswordResetToken>,
    @InjectRepository(Vendor)
    private readonly vendorsRepository: MongoRepository<Vendor>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext = {}) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin users must be created using the admin seeder');
    }

    const existingUser = await this.usersRepository.findOne({
      where: {
        $or: [
          { email: normalizedEmail },
          ...(dto.phone ? [{ phone: dto.phone.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with provided email or phone');
    }

    const user = this.usersRepository.create({
      email: normalizedEmail,
      phone: dto.phone?.trim() ?? null,
      passwordHash: await bcrypt.hash(dto.password, 12),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      role: dto.role ?? UserRole.CUSTOMER,
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    const savedUser = await this.usersRepository.save(user);

    if (savedUser.role === UserRole.VENDOR) {
      const vendor = this.vendorsRepository.create({
        userId: savedUser._id,
        businessName: dto.businessName!.trim(),
        businessSlug: dto.businessSlug?.trim()
          ? slugify(dto.businessSlug)
          : slugify(dto.businessName!.trim()),
      });

      await this.vendorsRepository.save(vendor);
    }

    return this.buildAuthResponse(savedUser, context);
  }

  async login(dto: LoginDto, context: RequestContext = {}) {
    const user = await this.usersRepository.findOneBy({
      email: dto.email.trim().toLowerCase(),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValidPassword || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    return this.buildAuthResponse(user, context);
  }

  async refreshToken(dto: RefreshTokenDto, context: RequestContext = {}) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const storedToken = await this.refreshTokensRepository.findOneBy({
      tokenId: payload.tokenId,
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const isMatch = await bcrypt.compare(dto.refreshToken, storedToken.tokenHash);

    if (!isMatch) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const user = await this.usersRepository.findOneBy({
      uuid: payload.sub,
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    storedToken.revokedAt = new Date();
    storedToken.lastUsedAt = new Date();
    await this.refreshTokensRepository.save(storedToken);

    return this.buildAuthResponse(user, context);
  }

  async logout(dto: RefreshTokenDto) {
    try {
      const payload = await this.verifyRefreshToken(dto.refreshToken);
      const token = await this.refreshTokensRepository.findOneBy({
        tokenId: payload.tokenId,
      });

      if (token && !token.revokedAt) {
        token.revokedAt = new Date();
        await this.refreshTokensRepository.save(token);
      }
    } catch {
      return { message: 'Logged out successfully' };
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOneBy({
      email: dto.email.trim().toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return {
        message:
          'If an account exists with that email, a password reset link has been generated.',
      };
    }

    const tokenId = uuidv4();
    const secret = randomBytes(24).toString('hex');
    const rawToken = `${tokenId}.${secret}`;

    const resetToken = this.passwordResetTokensRepository.create({
      userId: user._id,
      tokenId,
      tokenHash: await bcrypt.hash(secret, 12),
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    });

    await this.passwordResetTokensRepository.save(resetToken);

    return {
      message:
        'If an account exists with that email, a password reset link has been generated.',
      resetToken: this.isProduction() ? undefined : rawToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const [tokenId, secret] = dto.token.split('.');

    if (!tokenId || !secret) {
      throw new BadRequestException('Invalid reset token format');
    }

    const resetToken = await this.passwordResetTokensRepository.findOneBy({
      tokenId,
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now() ||
      !(await bcrypt.compare(secret, resetToken.tokenHash))
    ) {
      throw new UnauthorizedException('Reset token expired or invalid');
    }

    const user = await this.usersRepository.findOneBy({
      _id: resetToken.userId,
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.usersRepository.save(user);

    resetToken.usedAt = new Date();
    await this.passwordResetTokensRepository.save(resetToken);

    const activeRefreshTokens = await this.refreshTokensRepository.findBy({
      userId: user._id,
      revokedAt: null,
    });

    if (activeRefreshTokens.length > 0) {
      await Promise.all(
        activeRefreshTokens.map((token) => {
          token.revokedAt = new Date();
          return this.refreshTokensRepository.save(token);
        }),
      );
    }

    return { message: 'Password reset successful. Please login again.' };
  }

  async me(userUuid: string) {
    const user = await this.usersRepository.findOneBy({
      uuid: userUuid,
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    return this.serializeUser(user);
  }

  private async buildAuthResponse(user: User, context: RequestContext) {
    const accessPayload: AccessTokenPayload = {
      sub: user.uuid,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(accessPayload);

    const tokenId = uuidv4();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.uuid,
      tokenId,
      type: 'refresh',
    };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>(
        'jwt.refreshExpiresIn',
      ) as SignOptions['expiresIn'],
    });
    const decodedRefreshToken = this.jwtService.decode(refreshToken) as { exp?: number } | null;

    const refreshTokenEntity = this.refreshTokensRepository.create({
      userId: user._id,
      tokenId,
      tokenHash: await bcrypt.hash(refreshToken, 12),
      expiresAt: new Date((decodedRefreshToken?.exp ?? 0) * 1000),
      deviceInfo: context.userAgent ? { userAgent: context.userAgent } : null,
      ipAddress: context.ipAddress ?? null,
    });

    await this.refreshTokensRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      user: this.serializeUser(user),
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  private serializeUser(user: User) {
    return {
      id: objectIdToString(user._id),
      uuid: user.uuid,
      email: user.email,
      phone: user.phone ?? null,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }

  private isProduction() {
    return this.configService.get<string>('app.nodeEnv') === 'production';
  }
}
