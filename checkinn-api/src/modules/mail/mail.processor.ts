import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

interface EmailJobData {
  email: string;
  nome: string;
  checkInDate?: string | Date;
}

@Processor('email-notification')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  async process(job: Job<EmailJobData>): Promise<any> {
    const { email, nome, checkInDate } = job.data;

    // Simulação de operação assíncrona (ex: chamada ao provedor de e-mail)
    await this.simulateAsyncEmailProvider();

    if (job.name === 'enviar-boas-vindas') {
      this.logger.log(
        `[Worker] Enviando e-mail de boas-vindas de check-in para: ${email} (nome: ${nome})`,
      );
    } else if (job.name === 'lembrar-checkin-amanha') {
      this.logger.log(
        `[Worker] Enviando lembrete de check-in para: ${email} (nome: ${nome}) - check-in em: ${checkInDate?.toString()}`,
      );
    } else {
      this.logger.warn(
        `[Worker] Job desconhecido: ${job.name} para ${email}. Data recebida: ${JSON.stringify(job.data)}`,
      );
    }

    // Em um caso real chamariamos o provedor ex: Nodemailer
    return { sent: true };
  }

  private simulateAsyncEmailProvider(): Promise<void> {
    return Promise.resolve();
  }
}
