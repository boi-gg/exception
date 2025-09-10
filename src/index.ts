export type ExceptionCause = Error | string | undefined;
export type ExceptionMeta = Partial<Record<string, unknown>> | undefined;

export class Exception extends Error {
  public readonly message: string;
  public readonly meta?: ExceptionMeta;
  public readonly cause?: ExceptionCause;
  public readonly name: string;

  private constructor(message: string, meta?: ExceptionMeta, cause?: ExceptionCause, name = "Exception") {
    super(message || "UNKNOWN EXCEPTION OCCURED", { cause });
    this.message = message || "UNKNOWN EXCEPTION OCCURED";
    this.meta = meta;
    this.cause = cause;
    this.name = name;
  }

  /**
   * @param name The stable, descriptive name assigned to the produced subclass (e.g. "NotFoundError").
   * @returns A new subclass of Exception with the given name and meta type
   *
   * @example
   *
   * ```ts
   * const NotFoundError = Exception.kind<{ reqPath: string }>("NotFoundError");
   *
   * try {
   *   throw new NotFoundError("Resource not found", { reqPath: "/api/resource" }, new Error("Cause error"));
   * } catch (error) {
   *   if (NotFoundError.match(error)) {
   *     const reqPath = error.meta?.reqPath;
   *     const cause = error.cause;
   *     // Handle NotFoundError
   *   } else {
   *     throw error;
   *   }
   * }
   * ```
   */
  public static kind<Meta extends ExceptionMeta = undefined>(name: string) {
    return class $Exception extends Exception {
      constructor(
        message: string,
        public readonly meta?: Meta,
        public readonly cause?: ExceptionCause,
      ) {
        super(message, meta ? Object.freeze(meta) : meta, cause, name);
      }

      public static match(instance: unknown): instance is $Exception {
        return instance instanceof $Exception;
      }
    };
  }
}
