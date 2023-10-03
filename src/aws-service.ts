import {
  LambdaClient,
  UpdateFunctionCodeCommand,
} from "@aws-sdk/client-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Profile } from "./aws-profiles";

export class AWSService {
  private readonly s3Client: S3Client;
  private readonly lambdaClient: LambdaClient;

  constructor(profile: Profile) {
    const config = {
      region: profile.region,
      credentials: {
        accessKeyId: profile.aws_access_key_id,
        secretAccessKey: profile.aws_secret_access_key,
      },
    };
    this.s3Client = new S3Client(config);
    this.lambdaClient = new LambdaClient(config);
  }

  public async uploadToBucket(bucket: string, key: string, body: Buffer) {
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: body,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      const uploadResponse = await this.s3Client.send(command);
      return uploadResponse;
    } catch (err) {
      console.error("Error occurred while uploading to bucket: ", err);
      throw err;
    }
  }

  public async updateLambdaFunctionCode(
    functionName: string,
    bucket: string,
    key: string
  ) {
    const updateLambdaParams = {
      FunctionName: functionName,
      S3Bucket: bucket,
      S3Key: key,
    };

    try {
      const command = new UpdateFunctionCodeCommand(updateLambdaParams);
      const updateResponse = await this.lambdaClient.send(command);
      return updateResponse;
    } catch (err) {
      console.error(
        "Error occurred while updating lambda function code: ",
        err
      );
      throw err;
    }
  }
}
