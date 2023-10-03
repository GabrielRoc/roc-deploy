import { Separator } from "@inquirer/checkbox";
import { checkbox, confirm, input, select } from "@inquirer/prompts";
import { Profile, getAWSProfiles } from "./aws-profiles";
import { AwsRegion, AwsRegions } from "./aws-regions";

async function profileQuestion(): Promise<Profile> {
  const profiles = getAWSProfiles();
  const profileChoices: any[] = Object.keys(profiles).map((profile: string) => {
    return {
      name: profile,
      value: profiles[profile]!,
    };
  });
  profileChoices[0].name = "Padrão";
  profileChoices.splice(1, 0, new Separator());
  profileChoices.push(new Separator());
  profileChoices.push({
    name: "Personalizado",
    value: undefined,
  });
  let profileChoice: Profile = await select({
    message: "Selecione o perfil AWS:",
    choices: profileChoices,
  });

  if (!profileChoice) {
    profileChoice = {
      aws_access_key_id: await input({
        message: "Informe a access key:",
      }),
      aws_secret_access_key: await input({
        message: "Informe a secret key:",
      }),
    };
  }

  return profileChoice;
}

async function regionQuestion(profile: Profile): Promise<string> {
  let regionChoice: string | undefined = undefined;
  if (profile.region) regionChoice = profile.region;
  let useDefaultRegion = false;
  if (regionChoice) {
    useDefaultRegion = await confirm({
      message: `Deseja utilizar a região do perfil [${profile.region}]?`,
    });
  }
  if (!useDefaultRegion) {
    regionChoice = await select({
      message: "Selecione a região:",
      choices: AwsRegions.flat().map((region: AwsRegion) => {
        return {
          name: `${region.name} [${region.value}]`,
          value: region.value,
        };
      }),
    });
  }
  return regionChoice!;
}

async function lambdasQuestion(lambdaFunctions: any[]): Promise<string[]> {
  const lambdaOptions = lambdaFunctions.map((lambda: any) => {
    return {
      name: lambda.functionName,
      value: lambda.functionName,
    };
  });

  const lambdaChoices: string[] = await checkbox({
    message: "Selecione as lambdas:",
    choices: lambdaOptions,
  });

  return lambdaChoices;
}

async function packageManagerQuestion(): Promise<"npm" | "yarn"> {
  const packageManagerChoice: "npm" | "yarn" = await select({
    message: "Selecione o gerenciador de pacotes:",
    choices: [
      {
        name: "Yarn",
        value: "yarn",
        description: "Yarn Package Manager",
      },
      {
        name: "NPM",
        value: "npm",
        description: "Node Package Manager",
      },
    ],
  });

  return packageManagerChoice;
}

async function environmentQuestion(env: any): Promise<string> {
  const environmentOptions = Object.keys(env).map((environment: string) => {
    return {
      name: env[environment].name,
      description: env[environment].description,
      value: environment,
    };
  });

  const environmentChoice: string = await select({
    message: "Selecione o ambiente:",
    choices: environmentOptions,
  });

  if (env[environmentChoice].warning) {
    const confirmChoice = await confirm({
      message: env[environmentChoice].warning,
      default: false,
    });
    if (!confirmChoice) return await environmentQuestion(env);
  }

  return environmentChoice;
}

export async function form(language: string, env: any, lambdaFunctions: any[]) {
  try {
    const profile = await profileQuestion();
    const region = await regionQuestion(profile);
    const environment = await environmentQuestion(env);
    const lambdas = await lambdasQuestion(lambdaFunctions);
    const packageManager = ["typescript", "javascript"].includes(language)
      ? await packageManagerQuestion()
      : undefined;

    return {
      profile,
      region,
      environment,
      lambdas,
      packageManager,
    };
  } catch (error: any) {
    console.log(`Erro ao executar o formulário: ${error.message}`);
    throw error;
  }
}
