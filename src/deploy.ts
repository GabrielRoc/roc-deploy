import archiver from "archiver";
import { exec } from "child_process";
import { Presets, SingleBar } from "cli-progress";
import { createWriteStream, readFileSync, unlinkSync } from "fs";
import { AWSService } from "./aws-service";

async function buildCode(packageManager: "npm" | "yarn"): Promise<void> {
  try {
    const installPackageCommand = `${packageManager} install`;

    exec(installPackageCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`Erro ao instalar os pacotes: ${error.message}`);
        throw error;
      }
    });

    exec("node esbuild.config.js", (error, stdout, stderr) => {
      if (error) {
        console.log(`Erro ao excutar esbuild: ${error.message}`);
        throw error;
      }
    });
  } catch (error: any) {
    console.log(`Erro ao compilar o código: ${error.message}`);
    throw error;
  }
}

async function zipCode(source: string, out: string): Promise<void> {
  try {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = createWriteStream(out);

    return new Promise((resolve, reject) => {
      archive
        .glob("**/*", { cwd: source, ignore: ["node_modules/**", out] })
        .on("error", (err: any) => reject(err))
        .pipe(stream);

      stream.on("close", () => resolve());
      archive.finalize();
    });
  } catch (error: any) {
    console.log(`Erro ao compactar o código: ${error.message}`);
    throw error;
  }
}

async function deployCode(
  awsService: AWSService,
  bucketName: string,
  path: string
): Promise<void> {
  try {
    const fileBuffer = readFileSync("lambda.zip");
    await awsService.uploadToBucket(
      bucketName,
      `${path}/lambda.zip`,
      fileBuffer
    );
  } catch (error: any) {
    console.log(`Erro ao enviar o código para o bucket: ${error.message}`);
    throw error;
  }
}

async function deployLambdas(
  awsService: AWSService,
  bucketName: string,
  path: string,
  lambdaNames: string[]
) {
  try {
    console.log("Atualizando lambdas");
    const loadingBar = new SingleBar({}, Presets.shades_classic);
    loadingBar.start(lambdaNames.length, 0);

    for (const lambdaName of lambdaNames) {
      await awsService.updateLambdaFunctionCode(
        lambdaName,
        bucketName,
        `${path}/lambda.zip`
      );
      loadingBar.increment();
    }

    loadingBar.stop();
  } catch (error: any) {
    console.log(`Erro ao atualizar as lambdas: ${error.message}`);
    throw error;
  }
}

async function deleteZipFile(): Promise<void> {
  try {
    unlinkSync("lambda.zip");
  } catch (error: any) {
    console.log(`Erro ao excluir o arquivo zip: ${error.message}`);
    throw error;
  }
}

export async function deploy(
  packageManager: "npm" | "yarn" | undefined,
  awsService: AWSService,
  bucketName: string,
  path: string,
  lambdaNames: string[]
): Promise<void> {
  try {
    if (packageManager) {
      await buildCode(packageManager);
      await zipCode("dist", "lambda.zip");
    } else {
      await zipCode("./", "lambda.zip");
    }
    await deployCode(awsService, bucketName, path);
    await deployLambdas(awsService, bucketName, path, lambdaNames);
    await deleteZipFile();
  } catch (error: any) {
    console.log(`Erro ao realizar o deploy: ${error.message}`);
    throw error;
  }
}
