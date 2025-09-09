import { expect, it, expectTypeOf, describe } from "vitest";

import { Exception } from ".";

describe("Exception", () => {
  describe("Exception.kind()", () => {
    it("should create a new exception class with the correct name", () => {
      const CustomException = Exception.kind("CustomException");
      // The class is anonymous inside the factory
      expect(CustomException.name).toBe("$Exception");
      const instance = new CustomException("message");
      expect(instance.name).toBe("CustomException");
    });

    it("should create a class that extends Exception", () => {
      const CustomException = Exception.kind("CustomException");
      const instance = new CustomException("message");
      expect(instance).toBeInstanceOf(Exception);
      expect(instance).toBeInstanceOf(Error);
    });

    it("should allow creating exceptions with specific meta types", () => {
      type Meta = { foo: "bar" };
      const CustomException = Exception.kind<Meta>("CustomException");
      const instance = new CustomException("message", { foo: "bar" });
      expectTypeOf(instance.meta!).toEqualTypeOf<Meta>();
      expect(instance.meta?.foo).toBe("bar");
    });
  });

  describe("Exception instance", () => {
    const CustomException = Exception.kind<{ a: number }>("CustomException");

    it("should have the correct message", () => {
      const instance = new CustomException("This is a test.");
      expect(instance.message).toBe("This is a test.");
    });

    it("should default to a generic message if none is provided", () => {
      // @ts-expect-error message is required
      const instance = new CustomException(undefined);
      expect(instance.message).toBe("UNKNOWN EXCEPTION OCCURED");
    });

    it("should have the correct metadata", () => {
      const instance = new CustomException("message", { a: 1 });
      expect(instance.meta).toEqual({ a: 1 });
    });

    it("should have a frozen meta object", () => {
      const instance = new CustomException("message", { a: 1 });
      expect(Object.isFrozen(instance.meta)).toBe(true);
    });

    it("should handle different types of causes", () => {
      const errorCause = new Error("cause error");
      const instance1 = new CustomException("message", undefined, errorCause);
      expect(instance1.cause).toBe(errorCause);

      const stringCause = "cause string";
      const instance2 = new CustomException("message", undefined, stringCause);
      expect(instance2.cause).toBe(stringCause);

      const instance3 = new CustomException("message", undefined, undefined);
      expect(instance3.cause).toBeUndefined();
    });

    it("should have the correct name", () => {
      const instance = new CustomException("message");
      expect(instance.name).toBe("CustomException");
    });
  });

  describe("Exception.match()", () => {
    const CustomException1 = Exception.kind("CustomException1");
    const CustomException2 = Exception.kind("CustomException2");

    it("should return true for instances of the same exception class", () => {
      const instance = new CustomException1("message");
      expect(CustomException1.match(instance)).toBe(true);
    });

    it("should return false for instances of different exception classes", () => {
      const instance = new CustomException2("message");
      expect(CustomException1.match(instance)).toBe(false);
    });

    it("should return false for other error types", () => {
      const error = new Error("A generic error");
      expect(CustomException1.match(error)).toBe(false);
    });

    it("should return false for non-error objects", () => {
      expect(CustomException1.match({})).toBe(false);
      expect(CustomException1.match(null)).toBe(false);
      expect(CustomException1.match(undefined)).toBe(false);
      expect(CustomException1.match("string")).toBe(false);
    });
  });

  it("should work with the example from the docs", () => {
    const NotFoundError = Exception.kind<{ reqPath: string }>("NotFoundError");

    let wasHandled = false;
    try {
      throw new NotFoundError(
        "Resource not found",
        { reqPath: "/api/resource" },
        new Error("Cause error"),
      );
    } catch (error) {
      if (NotFoundError.match(error)) {
        wasHandled = true;
        expect(error.meta?.reqPath).toBe("/api/resource");
        expect(error.cause).toBeInstanceOf(Error);
      } else {
        throw error;
      }
    }
    expect(wasHandled).toBe(true);
  });
});
