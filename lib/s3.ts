import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1', // MinIO는 리전 무관
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // MinIO 필수 설정
});

export const BUCKET_NAME = process.env.S3_BUCKET || 'insurance-pdfs';
