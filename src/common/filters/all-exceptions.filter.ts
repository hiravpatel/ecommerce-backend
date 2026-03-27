import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RESPONSE_MESSAGES } from '../constants/response-messages.constant';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const normalized = this.normalizeExceptionResponse(exceptionResponse, statusCode);

    response.status(statusCode).json({
      statusCode,
      message: normalized.message,
      error: normalized.error,
      details: normalized.details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalizeExceptionResponse(
    exceptionResponse: string | object | null,
    statusCode: number,
  ) {
    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        error: this.getDefaultErrorLabel(statusCode),
        details: undefined as string[] | undefined,
      };
    }

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const response = exceptionResponse as {
        message?: string | string[];
        error?: string;
        details?: string[];
      };

      const details = response.details ?? (Array.isArray(response.message) ? response.message : undefined);

      return {
        message: response.message ?? this.getDefaultMessage(statusCode),
        error: response.error ?? this.getDefaultErrorLabel(statusCode),
        details,
      };
    }

    return {
      message: this.getDefaultMessage(statusCode),
      error: this.getDefaultErrorLabel(statusCode),
      details: undefined as string[] | undefined,
    };
  }

  private getDefaultMessage(statusCode: number) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return RESPONSE_MESSAGES.COMMON.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return RESPONSE_MESSAGES.COMMON.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return RESPONSE_MESSAGES.COMMON.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return RESPONSE_MESSAGES.COMMON.NOT_FOUND;
      default:
        return RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR;
    }
  }

  private getDefaultErrorLabel(statusCode: number) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      default:
        return 'Internal Server Error';
    }
  }
}
