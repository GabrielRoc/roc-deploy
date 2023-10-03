import { readFileSync } from "fs";

export type Language = "javascript" | "typescript" | "python";

export type Path = string;

export interface IEnvConfig {
  bucket: string;
  name: string;
  description: string;
  warning?: string;
}

export interface ILambdaConfig {
  functionName: string;
}

export interface IDeployConfig {
  language: Language;
  env: {
    [key: string]: IEnvConfig;
  };
  path: Path;
  lambdaFunctions: ILambdaConfig[];
}

export class DeployConfig implements IDeployConfig {
  language: Language;
  env: {
    [key: string]: IEnvConfig;
  };
  path: Path;
  lambdaFunctions: ILambdaConfig[];

  constructor({ language, env, path, lambdaFunctions }: IDeployConfig) {
    this.language = language;
    this.env = env;
    this.path = path;
    this.lambdaFunctions = lambdaFunctions;
  }
}

export function loadConfig(): IDeployConfig {
  const deployConfigBuffer = readFileSync("deploy-config.json");
  const deployConfig = JSON.parse(deployConfigBuffer.toString());

  return new DeployConfig(deployConfig);
}
