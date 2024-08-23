import {
  LambdaClient,
  UpdateFunctionCodeCommand,
} from "@aws-sdk/client-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Profile } from "./aws-profiles";
import { spawnSync } from 'child_process'

interface AWSServiceConfig {
  region: string | undefined;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}
export class AWSService {
  private readonly s3Client: S3Client;
  private readonly lambdaClient: LambdaClient;

  private ssoTriggerKeys = ["sso_account_id",
    "sso_region",
    "sso_role_name",
    "sso_start_url"]
  constructor(profile: Profile, region: string) {
    const config: AWSServiceConfig = {
      region: region,
    }
    if (this.ssoTriggerKeys.some(key => key in profile.config)) {
      this.handleSsoLogin(profile.profileName)
    } else {
      config.credentials = {
        accessKeyId: profile.credentials!.aws_access_key_id,
        secretAccessKey: profile.credentials!.aws_secret_access_key,
      } as any
    }
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

  private handleSsoLogin(profile_name: string): undefined {
    const result = spawnSync(`aws sso login --profile ${profile_name}`, { shell: true, stdio: 'inherit' });

    if (result.error) {
      throw Error(`Error executing command: ${result.error.message}`)
    }
  }
}