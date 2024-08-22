import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";
import { AWSService } from "./aws-service";
import { deploy } from "./deploy";
import { form } from "./form";
import { loadConfig } from "./load-config";

async function main() {
  try {
    figlet.parseFont("Standard", standard);
    console.log(figlet.textSync("Roc Deploy", { font: "Standard" }));

    const { language, env, path, lambdaFunctions } = loadConfig();

    const { profile, region, environment, lambdas, packageManager } =
      await form(language, env, lambdaFunctions);

    const awsService = new AWSService(
      profile,
      region,
    );

    await deploy(
      packageManager,
      awsService,
      env[environment]!.bucket,
      path,
      lambdas
    );
  } catch (error: any) {
    console.log(`Erro ao executar o deploy: ${error.message}`);
    throw error;
  }
}

(async () => {
  await main();
})();
