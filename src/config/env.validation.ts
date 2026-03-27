type EnvRecord = Record<string, string | undefined>;

const requiredEnvKeys = [
  'APP_PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'MONGODB_DB',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
] as const;

export default function validateEnv(config: EnvRecord): EnvRecord {
  const missingKeys = requiredEnvKeys.filter((key) => !config[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }

  return config;
}

export { requiredEnvKeys };
