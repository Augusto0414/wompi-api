/**
 * Railway Oriented Programming Result pattern
 * Used for explicit error handling in use cases
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly ok = true;
  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  flatMap<U, E2>(fn: (value: T) => Result<U, E2>): Result<U, E2> {
    return fn(this.value);
  }
}

export class Failure<E> {
  readonly ok = false;
  constructor(public readonly error: E) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  flatMap<U, E2>(_fn: (value: never) => Result<U, E2>): Result<never, E> {
    return this as unknown as Result<never, E>;
  }
}

export const ok = <T>(value: T): Success<T> => new Success(value);
export const fail = <E>(error: E): Failure<E> => new Failure(error);

export type AppError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'VALIDATION_ERROR'; message: string }
  | { code: 'INSUFFICIENT_STOCK'; message: string }
  | { code: 'PAYMENT_FAILED'; message: string }
  | { code: 'TRANSACTION_ALREADY_PROCESSED'; message: string };
