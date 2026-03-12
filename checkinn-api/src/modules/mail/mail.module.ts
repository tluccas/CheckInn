import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { MailQueuesModule } from '../../infrastructure/menssaging/mail-queues.module';

@Module({
  imports: [MailQueuesModule],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
