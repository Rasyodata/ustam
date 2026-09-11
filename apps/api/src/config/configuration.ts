/** Ustam — merkezi ortam konfigürasyonu. */
export default () => ({
  env: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.API_PORT ?? "4000", 10),
  defaultLocale: process.env.DEFAULT_LOCALE ?? "tr",
  supportedLocales: (process.env.SUPPORTED_LOCALES ?? "tr,en,de,fr,es").split(","),
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001",

  database: { url: process.env.DATABASE_URL },
  redis: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",
  },

  security: {
    passwordPepper: process.env.PASSWORD_PEPPER ?? "",
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL ?? "60", 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? "120", 10),
    otpTtlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? "300", 10),
    otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? "5", 10),
  },

  mail: {
    host: process.env.MAIL_HOST ?? "localhost",
    port: parseInt(process.env.MAIL_PORT ?? "1025", 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM ?? "Ustam <no-reply@ustam.app>",
  },

  sms: {
    provider: process.env.SMS_PROVIDER ?? "mock",
    apiKey: process.env.SMS_API_KEY,
    apiSecret: process.env.SMS_API_SECRET,
    sender: process.env.SMS_SENDER ?? "USTAM",
  },

  meili: {
    host: process.env.MEILI_HOST ?? "http://localhost:7700",
    masterKey: process.env.MEILI_MASTER_KEY ?? "",
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER ?? "mock",
    apiKey: process.env.PAYMENT_API_KEY,
    apiSecret: process.env.PAYMENT_API_SECRET,
    commissionRate: parseFloat(process.env.COMMISSION_RATE ?? "0.10"),
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET ?? "ustam-media",
    publicUrl: process.env.S3_PUBLIC_URL,
  },
});
