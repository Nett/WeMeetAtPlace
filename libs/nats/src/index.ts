export * from './nats.module';
export * from './nats.config';
export * from './nats.env-validation';
export const NATS_TIMEOUT = 3000;
export const NATS_BUS_NAME = `WEMEETATPLACE-NATS-BUS`;
export const NATS_USER_QUEUE = `user-queue-${process.env.K8S_NAMESPACE}`;
export const NATS_CREATE_USER_PATTERN = `${process.env.K8S_NAMESPACE}.user.create`;
export const NATS_LOGIN_USER_PATTERN = `${process.env.K8S_NAMESPACE}.user.login`;