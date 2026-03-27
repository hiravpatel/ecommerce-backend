import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { objectIdToString } from 'src/common/database/object-id.util';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { UserRepository } from 'src/modules/users/data/repositories/user.repository';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findActiveByUuid(payload.sub);

    if (!user) {
      throw new UnauthorizedException(RESPONSE_MESSAGES.AUTH.ACCOUNT_NOT_FOUND);
    }

    return {
      id: objectIdToString(user._id),
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
