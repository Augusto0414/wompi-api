import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class S3StorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('s3.region');
    const bucket = this.configService.get<string>('s3.bucket');
    const accessKeyId = this.configService.get<string>('s3.accessKeyId');
    const secretAccessKey =
      this.configService.get<string>('s3.secretAccessKey');

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Missing required S3 configuration. Please set AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.',
      );
    }

    this.region = region;
    this.bucket = bucket;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    const fileExtension = this.getFileExtension(file.originalname);
    const key = `products/${productId}/${uuidv4()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { key, url };
  }

  async uploadMultipleProductImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadProductImage(productId, file),
    );
    return Promise.all(uploadPromises);
  }

  async deleteProductImage(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }
}
