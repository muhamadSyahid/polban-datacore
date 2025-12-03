import * as Joi from 'joi';

export const validationSchema = Joi.object({
  HOST: Joi.string().default('localhost'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  DATAHUB_URL: Joi.string().required(),
  DATACORE_SYSTEM_EMAIL: Joi.string().required(),
  DATACORE_SYSTEM_PASSWORD: Joi.string().required(),
});
