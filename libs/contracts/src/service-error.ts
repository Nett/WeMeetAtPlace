// libs/contracts/src/common/service-error.ts
export type ServiceError =
  | { code: 'VALIDATION'; message: string; fields?: Record<string, string> }
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'CONFLICT'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'INTERNAL'; message: string };

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };