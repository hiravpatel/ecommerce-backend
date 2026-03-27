import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseMongoRepository<User> {
  constructor(
    @InjectRepository(User)
    repository: MongoRepository<User>,
  ) {
    super(repository);
  }

  findByEmail(email: string) {
    return this.findOneBy({ email });
  }

  findByPhone(phone: string) {
    return this.findOneBy({ phone });
  }

  findActiveByUuid(uuid: string) {
    return this.findOneBy({ uuid, isActive: true });
  }
}
