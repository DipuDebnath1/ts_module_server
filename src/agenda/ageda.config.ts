/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agenda } from 'agenda';
import { sendEmailReminderJob } from './jobs/reminder.job';
import { logger } from '../app/logger';

export async function setupAgenda(): Promise<Agenda> {
  try {
    const agenda = new Agenda({
      db: { address: 'mongodb://localhost:27017', collection: 'agendaJobs' },
    });

    // Register all jobs here
    const jobs = [sendEmailReminderJob];

    for (const job of jobs) {
      agenda.define(job.name, job.handler);
    }

    await agenda.start();
    logger.info('✅ Agenda started and jobs registered successfully');

    return agenda;
  } catch (error: any) {
    logger.error(`❌ Failed to setup Agenda: ${error.message}`);
    throw error;
  }
}
