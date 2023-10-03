import { readFileSync } from "fs";
import { parse } from "ini";
import { homedir } from "os";
import { join } from "path";

export interface Profile {
  aws_access_key_id: string;
  aws_secret_access_key: string;
  region?: string;
  [propName: string]: any;
}

export interface Profiles {
  [profile: string]: Profile;
}

export function getAWSProfiles(): Profiles {
  const credentialsPath = join(homedir(), ".aws", "credentials");
  const configPath = join(homedir(), ".aws", "config");

  const credentials: Profiles = parse(readFileSync(credentialsPath, "utf-8"));
  const config: Profiles = parse(readFileSync(configPath, "utf-8"));

  for (const profile in config) {
    const cleanedProfile = profile.replace(/^profile /, "");
    if (credentials[cleanedProfile]) {
      credentials[cleanedProfile] = {
        ...credentials[cleanedProfile],
        ...config[profile],
      } as Profile;
    }
  }

  return credentials;
}
