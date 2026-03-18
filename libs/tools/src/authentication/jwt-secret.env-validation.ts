import * as Joi from 'joi';

export const JwtEnvValidationSchema = Joi.object({
  JWT_AUTH_SECRET: Joi.string().min(32).max(256).required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
