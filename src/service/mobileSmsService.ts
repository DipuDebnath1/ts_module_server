import { PublishCommand } from '@aws-sdk/client-sns';
import { logger } from '../app/logger';
// import config from '../config';
import { snsClient } from '../config/aws.config';

// Function to send SMS
export async function sendSMS(mobileNo: string, message: string) {
  if (!mobileNo) return logger.error('Mobile number is required');
  if (!message) return logger.error('Message is required');

  try {
    const params = {
      Message: message,
      PhoneNumber: mobileNo, // Required
    };

    const command = new PublishCommand(params);
    const data = await snsClient.send(command);
    logger.info('OTP SEND SUCCESS to ' + mobileNo);
    logger.info('Otp send Response ' + JSON.stringify(data));
    return data;
  } catch (err) {
    logger.error('Error sending SMS:', err);
    return err;
  }
}

// Function to send OTP
export async function sendOtpByPhone(mobileNo: string, OTP: string) {
  if (!mobileNo) return logger.error('Mobile number is required');
  if (!OTP) return logger.error('OTP is required');

  const params = {
    Message: `Your Verification Code : ${OTP}\nDo not share this code with anyone.\nThanks`,
    PhoneNumber: mobileNo, // Required
  };

  const command = new PublishCommand(params);

  try {
    const data = await snsClient.send(command);
    logger.info('OTP SEND SUCCESS to ' + mobileNo);
    logger.info('Otp send Response ' + JSON.stringify(data));
    return data;
  } catch (err) {
    logger.error('Error sending OTP:', err);
    return err;
  }
}
