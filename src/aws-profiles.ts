import { readFileSync } from "fs";
import { parse } from "ini";
import { homedir } from "os";
import { join } from "path";

export interface AWSCredentials {
  aws_access_key_id: string;
  aws_secret_access_key: string;
}
export interface AWSConfig {
  sso_start_url?: string;
  sso_region?: string;
  sso_account_id?: string;
  sso_role_name?: string;
  region?: string;
  output?: string;
}
export interface Profile {
  credentials?: AWSCredentials;
  config: AWSConfig;
  [propName: string]: any;
  profileName: string
}

export interface Profiles {
  [profile: string]: Profile;
}

interface ConfigFile {
  [profile: string]: AWSConfig;
}

interface CredentialsFile {
  [profile: string]: AWSCredentials;
}
export function getAWSProfiles(): Profiles {
  let profiles: Profiles = {}
  const credentialsPath = join(homedir(), ".aws", "credentials");
  const configPath = join(homedir(), ".aws", "config");

  const credentials: CredentialsFile = parse(readFileSync(credentialsPath, "utf-8"));
  const config: ConfigFile = parse(readFileSync(configPath, "utf-8"));

  for (const profile in credentials) {
    profiles[profile] = {
      credentials: credentials[profile],
      config: {},
      profileName: profile
    } as Profile;
  }
  for (const profile in config) {
    const cleanedProfile = profile.replace(/^profile /, "");
    if (!profiles[cleanedProfile])
      profiles[cleanedProfile] = { config: {}, profileName: cleanedProfile };
    profiles[cleanedProfile].config = config[profile] as AWSConfig
  }
  return profiles;
}