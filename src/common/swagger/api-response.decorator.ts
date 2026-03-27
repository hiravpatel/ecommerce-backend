import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

type SuccessResponseOptions = {
  status: HttpStatus;
  message: string;
  type?: Type<unknown>;
  example: unknown;
};

type ErrorResponseOptions = {
  status: HttpStatus;
  message: string | string[];
  error: string;
  exampleDetails?: string[];
};

export function ApiSuccessResponse(options: SuccessResponseOptions) {
  const extraModels = options.type ? [ApiResponseDto, options.type] : [ApiResponseDto];

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiResponse({
      status: options.status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              statusCode: {
                type: 'number',
                example: options.status,
              },
              message: {
                type: 'string',
                example: options.message,
              },
              data: options.type
                ? { $ref: getSchemaPath(options.type) }
                : {
                    type: 'null',
                    example: null,
                    nullable: true,
                  },
            },
          },
        ],
        example: {
          statusCode: options.status,
          message: options.message,
          data: options.example,
        },
      },
    }),
  );
}

export function ApiStandardErrorResponse(options: ErrorResponseOptions) {
  return applyDecorators(
    ApiExtraModels(ApiErrorResponseDto),
    ApiResponse({
      status: options.status,
      type: ApiErrorResponseDto,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiErrorResponseDto) },
          {
            example: {
              statusCode: options.status,
              message: options.message,
              error: options.error,
              details: options.exampleDetails,
              path: '/api/v1/auth/login'
                        },
          },
        ],
      },
    }),
  );
}
