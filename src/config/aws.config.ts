import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import config from '../config'; // Assuming config is an external config file
import { SNSClient } from '@aws-sdk/client-sns';

// Type definition for the config file (if you don't already have it)
interface AwsConfig {
  aws: {
    bucketRegion?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

const awsConfig: AwsConfig = config; // Ensuring config has the correct types

// Create an S3 client instance with proper typing
const s3Client: S3Client = new S3Client({
  region: awsConfig.aws.bucketRegion,
  credentials: {
    accessKeyId: awsConfig.aws.accessKeyId,
    secretAccessKey: awsConfig.aws.secretAccessKey,
  },
} as S3ClientConfig); // Type assertion to ensure compatibility with S3ClientConfig

// Create a new SNSClient instance
const snsClient = new SNSClient({
  region: awsConfig.aws.bucketRegion as string,
  credentials: {
    accessKeyId: awsConfig.aws.accessKeyId as string,
    secretAccessKey: awsConfig.aws.secretAccessKey as string,
  },
});

export { s3Client, snsClient };
