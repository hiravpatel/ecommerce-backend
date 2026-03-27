import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import {
  ApiStandardErrorResponse,
  ApiSuccessResponse,
} from 'src/common/swagger/api-response.decorator';
import { AuthService } from '../../infrastructure/services/auth.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthUserDto } from '../dto/auth-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordResponseDto } from '../dto/message-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getUserAgent(request: Request) {
    const userAgent = request.headers['user-agent'];
    return Array.isArray(userAgent) ? userAgent[0] : userAgent;
  }

  @Public()
  @Post('register')
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS)
  @ApiOperation({ summary: 'Register a new user or vendor account' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      customer: {
        summary: 'Customer register',
        value: {
          email: 'customer@example.com',
          phone: '+919876543210',
          password: 'StrongPass@123',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'customer',
        },
      },
      vendor: {
        summary: 'Vendor register',
        value: {
          email: 'vendor@example.com',
          phone: '+919999999999',
          password: 'StrongPass@123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'vendor',
          businessName: 'John Electronics Store',
          businessSlug: 'john-electronics-store',
        },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS,
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-signature',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-signature',
      user: {
        id: '67e4f0f78a6ef35a3b4f2e11',
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        email: 'vendor@example.com',
        phone: '+919876543210',
        firstName: 'John',
        lastName: 'Doe',
        role: 'vendor',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        lastLoginAt: null,
      },
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: RESPONSE_MESSAGES.COMMON.VALIDATION_FAILED,
    error: 'Bad Request',
    exampleDetails: ['email must be an email'],
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.CONFLICT,
    message: RESPONSE_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS,
    error: 'Conflict',
  })
  register(
    @Body() dto: RegisterDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
  ) {
    return this.authService.register(dto, {
      ipAddress,
      userAgent: this.getUserAgent(request),
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS)
  @ApiOperation({ summary: 'Login and receive access/refresh tokens' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-signature',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-signature',
      user: {
        id: '67e4f0f78a6ef35a3b4f2e11',
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        phone: '+919876543210',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        lastLoginAt: '2026-03-27T09:30:00.000Z',
      },
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: RESPONSE_MESSAGES.COMMON.VALIDATION_FAILED,
    error: 'Bad Request',
    exampleDetails: ['password must be longer than or equal to 8 characters'],
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    message: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS,
    error: 'Unauthorized',
  })
  login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
  ) {
    return this.authService.login(dto, {
      ipAddress,
      userAgent: this.getUserAgent(request),
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.REFRESH_SUCCESS)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.AUTH.REFRESH_SUCCESS,
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-access-token-signature',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-refresh-token-signature',
      user: {
        id: '67e4f0f78a6ef35a3b4f2e11',
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        phone: '+919876543210',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        lastLoginAt: '2026-03-27T09:30:00.000Z',
      },
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: RESPONSE_MESSAGES.COMMON.VALIDATION_FAILED,
    error: 'Bad Request',
    exampleDetails: ['refreshToken must be longer than or equal to 20 characters'],
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    message: RESPONSE_MESSAGES.AUTH.REFRESH_TOKEN_INVALID,
    error: 'Unauthorized',
  })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
  ) {
    return this.authService.refreshToken(dto, {
      ipAddress,
      userAgent: this.getUserAgent(request),
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer')
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.LOGOUT_SUCCESS)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.AUTH.LOGOUT_SUCCESS,
    example: null,
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: RESPONSE_MESSAGES.COMMON.VALIDATION_FAILED,
    error: 'Bad Request',
    exampleDetails: ['refreshToken must be longer than or equal to 20 characters'],
  })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS)
  @ApiOperation({ summary: 'Generate a password reset token' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS,
    type: ForgotPasswordResponseDto,
    example: {
      resetToken: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.8f14e45fceea167a5a36dedd4bea2543',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: RESPONSE_MESSAGES.COMMON.VALIDATION_FAILED,
    error: 'Bad Request',
    exampleDetails: ['email must be an email'],
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS)
  @ApiOperation({ summary: 'Reset account password using reset token' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS,
    example: null,
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    message: RESPONSE_MESSAGES.COMMON.VALIDATION_FAILED,
    error: 'Bad Request',
    exampleDetails: ['newPassword must be longer than or equal to 8 characters'],
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    message: RESPONSE_MESSAGES.AUTH.RESET_TOKEN_INVALID,
    error: 'Unauthorized',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ResponseMessage(RESPONSE_MESSAGES.AUTH.CURRENT_USER_FETCHED)
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.AUTH.CURRENT_USER_FETCHED,
    type: AuthUserDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2e11',
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@example.com',
      phone: '+919876543210',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      lastLoginAt: '2026-03-27T09:30:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    message: RESPONSE_MESSAGES.COMMON.UNAUTHORIZED,
    error: 'Unauthorized',
  })
  me(@CurrentUser('uuid') userUuid: string) {
    return this.authService.me(userUuid);
  }
}
