import { DeepPartial, FindOptionsWhere, MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

export abstract class BaseMongoRepository<TEntity extends { _id?: ObjectId }> {
  // Shared persistence helpers keep service classes focused on business rules instead of TypeORM details.
  protected constructor(protected readonly repository: MongoRepository<TEntity>) {}

  create(entityLike: DeepPartial<TEntity>) {
    return this.repository.create(entityLike);
  }

  save(entity: TEntity) {
    return this.repository.save(entity);
  }

  findOneBy(where: FindOptionsWhere<TEntity>) {
    return this.repository.findOneBy(where);
  }

  findBy(where: FindOptionsWhere<TEntity>) {
    return this.repository.findBy(where);
  }

  deleteById(id: ObjectId) {
    return this.repository.deleteOne({ _id: id } as FindOptionsWhere<TEntity>);
  }
}
