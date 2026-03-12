import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email-notification')
    private readonly mailQueue: Queue,
  ) {}

  async scheduleWelcomeEmail(email: string, nome: string) {
    const DOIS_HORAS_MS = 2 * 60 * 60 * 1000;

    await this.mailQueue.add(
      'enviar-boas-vindas',
      { email, nome },
      { delay: DOIS_HORAS_MS, attempts: 3 }, // Tentativas em caso de falha
    );
  }

  async schedulePreCheckinReminder(
    email: string,
    nome: string,
    checkInDate: string,
  ) {
    const now = new Date();

    // Momento alvo: 1 dia antes do check-in
    const target = new Date(checkInDate);
    target.setDate(target.getDate() - 1);

    let delay = target.getTime() - now.getTime();

    // Se já passou, dispara imediatamente (delay mínimo 0)
    if (delay < 0) {
      delay = 0;
    }

    await this.mailQueue.add(
      'lembrar-checkin-amanha',
      { email, nome, checkInDate },
      { delay, attempts: 3 },
    );
  }
}
