/* eslint-disable no-console */
import { Job } from 'agenda';

export interface SendEmailReminderData {
  email: string;
  message: string;
}

export const sendEmailReminderJob = {
  name: 'send email reminder',
  handler: async (job: Job<SendEmailReminderData>) => {
    try {
      const { email, message } = job.attrs.data;
      console.log(`📧 Sending reminder to ${email}: ${message}`);
      // Add email sending logic here
    } catch (error) {
      console.error('Send email reminder job error:', error);
      throw error;
    }
  },
};
