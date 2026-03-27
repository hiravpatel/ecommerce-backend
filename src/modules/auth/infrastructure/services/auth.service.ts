import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MongoServerError } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import type { SignOptions } from 'jsonwebtoken';
import {
  PasswordResetToken,
  RefreshToken,
} from '../../data/entities/refresh-token.entity';
import { PasswordResetTokenRepository } from '../../data/repositories/password-reset-token.repository';
import { RefreshTokenRepository } from '../../data/repositories/refresh-token.repository';
import { ForgotPasswordDto } from '../../presentation/dto/forgot-password.dto';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RefreshTokenDto } from '../../presentation/dto/refresh-token.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { ResetPasswordDto } from '../../presentation/dto/reset-password.dto';
import { User, UserRole } from 'src/modules/users/data/entities/user.entity';
import { objectIdToString } from 'src/common/database/object-id.util';
import { slugify } from 'src/common/utils/slug.util';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { UserRepository } from 'src/modules/users/data/repositories/user.repository';
import { VendorRepository } from 'src/modules/vendors/data/repositories/vendor.repository';

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
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly vendorRepository: VendorRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext = {}) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = dto.phone?.trim() || null;
    const userRole = dto.role ?? UserRole.CUSTOMER;
    const normalizedBusinessSlug =
      userRole === UserRole.VENDOR
        ? dto.businessSlug?.trim()
          ? slugify(dto.businessSlug)
          : slugify(dto.businessName!.trim())
        : null;

    if (userRole === UserRole.ADMIN) {
      throw new BadRequestException(RESPONSE_MESSAGES.AUTH.ADMIN_SEED_REQUIRED);
    }

    const existingUserByEmail = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUserByEmail) {
      throw new ConflictException(RESPONSE_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
    }

    if (normalizedPhone) {
      const existingUserByPhone = await this.userRepository.findByPhone(normalizedPhone);

      if (existingUserByPhone) {
        throw new ConflictException(RESPONSE_MESSAGES.AUTH.PHONE_ALREADY_EXISTS);
      }
    }

    if (normalizedBusinessSlug) {
      const existingVendor = await this.vendorRepository.findByBusinessSlug(
        normalizedBusinessSlug,
      );

      if (existingVendor) {
        throw new ConflictException(RESPONSE_MESSAGES.AUTH.BUSINESS_SLUG_ALREADY_EXISTS);
      }
    }

    const user = this.userRepository.create({
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: await bcrypt.hash(dto.password, 12),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      role: userRole,
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    let savedUser: User;

    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      this.handleRegistrationConflict(error, {
        email: normalizedEmail,
        phone: normalizedPhone,
      });
      throw error;
    }

    if (savedUser.role === UserRole.VENDOR) {
      const vendor = this.vendorRepository.create({
        userId: savedUser._id,
        businessName: dto.businessName!.trim(),
        businessSlug: normalizedBusinessSlug!,
      });

      try {
        await this.vendorRepository.save(vendor);
      } catch (error) {
        // Roll back the just-created user if vendor profile creation fails so registration stays atomic.
        await this.userRepository.deleteById(savedUser._id);
        this.handleRegistrationConflict(error, {
          email: normalizedEmail,
          phone: normalizedPhone,
          businessSlug: normalizedBusinessSlug,
        });
        throw error;
      }
    }

    return this.buildAuthResponse(savedUser, context);
  }

  async login(dto: LoginDto, context: RequestContext = {}) {
    const user = await this.userRepository.findByEmail(dto.email.trim().toLowerCase());

    if (!user) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValidPassword || !user.isActive) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.buildAuthResponse(user, context);
  }

  async refreshToken(dto: RefreshTokenDto, context: RequestContext = {}) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const storedToken = await this.refreshTokenRepository.findByTokenId(payload.tokenId);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
    }

    const isMatch = await bcrypt.compare(dto.refreshToken, storedToken.tokenHash);

    if (!isMatch) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
    }

    const user = await this.userRepository.findActiveByUuid(payload.sub);

    if (!user) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.ACCOUNT_NOT_FOUND);
    }

    storedToken.revokedAt = new Date();
    storedToken.lastUsedAt = new Date();
    await this.refreshTokenRepository.save(storedToken);

    return this.buildAuthResponse(user, context);
  }

  async logout(dto: RefreshTokenDto) {
    try {
      const payload = await this.verifyRefreshToken(dto.refreshToken);
      const token = await this.refreshTokenRepository.findByTokenId(payload.tokenId);

      if (token && !token.revokedAt) {
        token.revokedAt = new Date();
        await this.refreshTokenRepository.save(token);
      }
    } catch {
      return null;
    }

    return null;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOneBy({
      email: dto.email.trim().toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return null;
    }

    const tokenId = uuidv4();
    const secret = randomBytes(24).toString('hex');
    const rawToken = `${tokenId}.${secret}`;

    const resetToken = this.passwordResetTokenRepository.create({
      userId: user._id,
      tokenId,
      tokenHash: await bcrypt.hash(secret, 12),
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    });

    await this.passwordResetTokenRepository.save(resetToken);

    return {
      resetToken: this.isProduction() ? undefined : rawToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const [tokenId, secret] = dto.token.split('.');

    if (!tokenId || !secret) {
      throw new BadRequestException(RESPONSE_MESSAGES.AUTH.RESET_TOKEN_FORMAT_INVALID);
    }

    const resetToken = await this.passwordResetTokenRepository.findByTokenId(tokenId);

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now() ||
      !(await bcrypt.compare(secret, resetToken.tokenHash))
    ) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.RESET_TOKEN_INVALID);
    }

    const user = await this.userRepository.findOneBy({
      _id: resetToken.userId,
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.ACCOUNT_NOT_FOUND);
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.save(user);

    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(resetToken);

    const activeRefreshTokens = await this.refreshTokenRepository.findActiveByUserId(user._id);

    if (activeRefreshTokens.length > 0) {
      await Promise.all(
        activeRefreshTokens.map((token) => {
          token.revokedAt = new Date();
          return this.refreshTokenRepository.save(token);
        }),
      );
    }

    return null;
  }

  async me(userUuid: string) {
    const user = await this.userRepository.findActiveByUuid(userUuid);

    if (!user) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.ACCOUNT_NOT_FOUND);
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

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user._id,
      tokenId,
      tokenHash: await bcrypt.hash(refreshToken, 12),
      expiresAt: new Date((decodedRefreshToken?.exp ?? 0) * 1000),
      deviceInfo: context.userAgent ? { userAgent: context.userAgent } : null,
      ipAddress: context.ipAddress ?? null,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

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
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
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

  private handleRegistrationConflict(
    error: unknown,
    values: {
      email?: string | null;
      phone?: string | null;
      businessSlug?: string | null;
    },
  ): never | void {
    if (!(error instanceof MongoServerError) || error.code !== 11000) {
      return;
    }

    const duplicateValue = Object.values(error.keyValue ?? {})[0];

    if (duplicateValue === values.email) {
      throw new ConflictException(RESPONSE_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
    }

    if (duplicateValue === values.phone) {
      throw new ConflictException(RESPONSE_MESSAGES.AUTH.PHONE_ALREADY_EXISTS);
    }

    if (duplicateValue === values.businessSlug) {
      throw new ConflictException(RESPONSE_MESSAGES.AUTH.BUSINESS_SLUG_ALREADY_EXISTS);
    }

    throw new ConflictException(RESPONSE_MESSAGES.AUTH.USER_ALREADY_EXISTS);
  }
}
