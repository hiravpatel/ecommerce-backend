import { Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

@Entity('refresh_tokens')
@Index('UQ_REFRESH_TOKENS_TOKEN_ID', ['tokenId'], { unique: true })
@Index('IDX_REFRESH_TOKENS_USER', ['userId'])
@Index('IDX_REFRESH_TOKENS_EXPIRES_AT', ['expiresAt'], {
  expireAfterSeconds: 0,
})
export class RefreshToken extends BaseDocumentEntity {
  @Column()
  userId!: ObjectId;

  @Column()
  tokenId!: string;

  @Column()
  tokenHash!: string;

  @Column({ nullable: true })
  deviceInfo?: Record<string, unknown> | null;

  @Column({ nullable: true })
  ipAddress?: string | null;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true })
  revokedAt?: Date | null;

  @Column({ nullable: true })
  lastUsedAt?: Date | null;
}

@Entity('password_reset_tokens')
@Index('UQ_PASSWORD_RESET_TOKENS_TOKEN_ID', ['tokenId'], { unique: true })
@Index('IDX_PASSWORD_RESET_TOKENS_USER', ['userId'])
@Index('IDX_PASSWORD_RESET_TOKENS_EXPIRES_AT', ['expiresAt'], {
  expireAfterSeconds: 0,
})
export class PasswordResetToken extends BaseDocumentEntity {
  @Column()
  userId!: ObjectId;

  @Column()
  tokenId!: string;

  @Column()
  tokenHash!: string;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true })
  usedAt?: Date | null;
}
