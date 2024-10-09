import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { catchError, map, tap } from 'rxjs/operators';

import { AUTH_SERVICE } from '../constant';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private authClient: ClientProxy;

  constructor() {
    this.authClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'], // Docker 네트워크에서의 RabbitMQ 서비스 이름
        queue: 'auth_queue', // 인증 서비스 큐 이름
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwt =
      request?.cookies?.Authentication ||
      request?.Authentication ||
      request?.headers?.Authentication ||
      request?.headers?.authentication;
    if (!jwt) {
      return false;
    }

    try {
      const result = await lastValueFrom(
        this.authClient.send('authenticate', { Authentication: jwt }),
      );
      request.user = result;
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }
}
