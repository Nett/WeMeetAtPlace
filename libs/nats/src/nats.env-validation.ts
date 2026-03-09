import * as Joi from 'joi';

export const NatsEnvValidationSchema = Joi.object({
  NATS_URL: Joi.string().pattern(/^nats:\/\/.+/).required(),
});
