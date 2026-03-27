import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGES } from '../constants/response-messages.constant';
import { RESPONSE_MESSAGE_METADATA_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<{ statusCode: number }>();
    const handlerMessage =
      this.reflector.get<string>(RESPONSE_MESSAGE_METADATA_KEY, context.getHandler()) ??
      RESPONSE_MESSAGES.COMMON.SUCCESS;

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message: handlerMessage,
        data: data ?? null,
      })),
    );
  }
}
