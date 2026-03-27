import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export function toObjectId(value?: string | ObjectId | null): ObjectId | null {
  if (!value) {
    return null;
  }

  if (value instanceof ObjectId) {
    return value;
  }

  if (!ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid ObjectId: ${value}`);
  }

  return new ObjectId(value);
}

export function objectIdToString(value?: ObjectId | null): string | null {
  return value ? value.toHexString() : null;
}
