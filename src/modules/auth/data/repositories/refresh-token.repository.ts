import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends BaseMongoRepository<RefreshToken> {
  constructor(
    @InjectRepository(RefreshToken)
    repository: MongoRepository<RefreshToken>,
  ) {
    super(repository);
  }

  findByTokenId(tokenId: string) {
    return this.findOneBy({ tokenId });
  }

  async findActiveByUserId(userId: RefreshToken['userId']) {
    const tokens = await this.findBy({ userId });
    return tokens.filter((token) => !token.revokedAt);
  }
}
