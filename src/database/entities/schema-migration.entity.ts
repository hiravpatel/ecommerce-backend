import { Column, Entity, Index } from 'typeorm';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

@Entity('schema_migrations')
@Index('UQ_SCHEMA_MIGRATIONS_NAME', ['name'], { unique: true })
export class SchemaMigration extends BaseDocumentEntity {
  @Column()
  name!: string;

  @Column()
  executedAt!: Date;
}
