# RocDeploy

O script de deploy interativo simplifica a atualização de suas funções do AWS Lambda. Ele permite selecionar seu perfil AWS, ambiente e as funções Lambda que você deseja atualizar. Todo o processo de fazer upload do código e atualizar a função Lambda é feito automaticamente pelo script.

## Instalação

Para instalar o script, basta executar o comando abaixo no terminal:

```bash
yarn add -D roc-deploy
```

ou

```bash
npm install --save-dev roc-deploy
```

## Como utilizar

Para utilizar o script, basta utilizar o script você deve configurar o arquivo `deploy-config.json` e adicionar o seguinte comando no seu `package.json`:

```json
"scripts": {
  "deploy": "roc-deploy"
}
```

Este comando irá trazer ao terminal um menu interativo com a seguinte aparência:

```
  ____              ____             _
 |  _ \ ___   ___  |  _ \  ___ _ __ | | ___  _   _
 | |_) / _ \ / __| | | | |/ _ \ '_ \| |/ _ \| | | |
 |  _ < (_) | (__  | |_| |  __/ |_) | | (_) | |_| |
 |_| \_\___/ \___| |____/ \___| .__/|_|\___/ \__, |
                              |_|            |___/
? Selecione o perfil AWS: Padrão
? Deseja utilizar a região do perfil [us-east-1]? yes
? Selecione o ambiente: QA (Quality Assurance)
? Selecione as lambdas: node-deploy-teste
Atualizando lambdas
 ████████████████████████████████████████ 100% | ETA: 0s | 1/1
Done in 10.16s.
```

## Configuração

Para o correto funcionamento do script, é necessário criar um arquivo de configuração chamado `deploy-config.json` com a seguinte estrutura:

```json
{
  "language": "your_lambda_language",
  "env": {
    "qa": {
      "bucket": "your_bucket_name",
      "name": "environment_name",
      "description": "environment_description"
    },
    "prd": {
      "bucket": "your_bucket_name",
      "name": "environment_name",
      "description": "environment_description",
      "warning": "your_warning_message"
    }
  },
  "path": "your_deployment_path",
  "lambdaFunctions": [
    {
      "functionName": "your_lambda_function"
    }
  ]
}
```

As credenciais da AWS serão gerenciadas automaticamente pelo script, mostrando uma lista de perfis para você escolher.
