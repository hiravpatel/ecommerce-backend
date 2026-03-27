import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import {
  PasswordResetToken,
  RefreshToken,
} from './data/entities/refresh-token.entity';
import { PasswordResetTokenRepository } from './data/repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './data/repositories/refresh-token.repository';
import { AuthService } from './infrastructure/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';
import { User } from '../users/data/entities/user.entity';
import { UserRepository } from '../users/data/repositories/user.repository';
import { Vendor, VendorBankAccount } from '../vendors/data/entities/vendor.entity';
import { VendorBankAccountRepository } from '../vendors/data/repositories/vendor-bank-account.repository';
import { VendorRepository } from '../vendors/data/repositories/vendor.repository';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') as SignOptions['expiresIn'],
        },
      }),
    }),
    TypeOrmModule.forFeature([User, RefreshToken, PasswordResetToken, Vendor, VendorBankAccount]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserRepository,
    RefreshTokenRepository,
    PasswordResetTokenRepository,
    VendorRepository,
    VendorBankAccountRepository,
  ],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
