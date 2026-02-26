import Joi from "joi";

const envSchema = Joi.object({
  MONGO_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(10).required(),
  NEWS_API_KEY: Joi.string().required(),
  HF_TOKEN: Joi.string().required(),
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string().valid("development","production","test").default("development"),
}).unknown(); // permitir otras variables

export function validateEnv() {
  const { error, value } = envSchema.validate(process.env);
  if (error) {
    throw new Error(`Configuración de entorno inválida: ${error.message}`);
  }
  return value;
}
