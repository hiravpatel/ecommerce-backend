import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/modules/users/data/entities/user.entity';
import { objectIdToString } from 'src/common/database/object-id.util';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: MongoRepository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersRepository.findOneBy({
      uuid: payload.sub,
      isActive: true,
    });

    if (!user) {
      throw new UnauthorizedException('Account not found or inactive');
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
