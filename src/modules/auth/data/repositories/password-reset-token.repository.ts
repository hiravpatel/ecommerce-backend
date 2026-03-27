import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { PasswordResetToken } from '../entities/refresh-token.entity';

@Injectable()
export class PasswordResetTokenRepository extends BaseMongoRepository<PasswordResetToken> {
  constructor(
    @InjectRepository(PasswordResetToken)
    repository: MongoRepository<PasswordResetToken>,
  ) {
    super(repository);
  }

  findByTokenId(tokenId: string) {
    return this.findOneBy({ tokenId });
  }
}
