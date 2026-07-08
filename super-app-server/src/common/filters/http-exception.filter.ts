import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Lỗi hệ thống nội bộ';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj = exception.getResponse();
      if (typeof resObj === 'object' && resObj !== null) {
        const obj = resObj as Record<string, unknown>;
        if (typeof obj.message === 'string' || Array.isArray(obj.message)) {
          message = obj.message as string | string[];
        }
      } else if (typeof resObj === 'string') {
        message = resObj;
      }
    } else if (exception instanceof Error) {
      if (exception.name === 'MulterError') {
        status = HttpStatus.BAD_REQUEST;
        message = `File upload error: ${exception.message}`;
      } else {
        message = exception.message;
      }
    }

    this.logger.error(
      {
        url: request.url,
        method: request.method,
        status,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      `HTTP Exception: ${Array.isArray(message) ? message[0] : message}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message[0] : message,
    });
  }
}
