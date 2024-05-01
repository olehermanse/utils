import {
  is_class,
  is_instance,
  SchemaClass,
  to_class,
  type_of,
} from "../src/schema";
import { describe, expect, test } from "vitest";

class FooBar implements SchemaClass {
  foo: string;

  schema() {
    return {
      properties: {
        foo: { type: "string" },
      },
    };
  }

  constructor(foo?: string) {
    this.foo = foo ?? "";
  }
}

describe("to_class", () => {
  test("a valid string", () => {
    let s = '{"foo": "bar"}';
    let a = to_class(s, new FooBar());
    expect(a).not.toBe(null);
    expect(a).not.toBeInstanceOf(Error);
    expect(a?.foo).toBe("bar");
  });
  test("a valid object", () => {
    let s = { foo: "bar" };
    let a = <FooBar>to_class(s, new FooBar());
    expect(a).not.toBe(null);
    expect(a).not.toBeInstanceOf(Error);
    expect(a?.foo).toBe("bar");
  });
  test("a wrong type", () => {
    let s = { foo: 123 };
    let a = to_class(s, new FooBar());
    expect(a).toBeInstanceOf(Error);
  });
  test("a missing field", () => {
    let s = {};
    let a = to_class(s, new FooBar());
    expect(a).toBeInstanceOf(Error);
  });
});

describe("type_of", () => {
  test("a string", () => {
    expect(type_of("foobar")).toBe("string");
  });
  test("null", () => {
    expect(type_of(null)).toBe("null");
  });
  test("a number", () => {
    expect(type_of(3)).toBe("number");
  });
  test("not a number", () => {
    expect(type_of(0 / 0)).toBe("nan");
  });
  test("a class", () => {
    expect(type_of(FooBar)).toBe("class FooBar");
  });
  test("an array", () => {
    expect(type_of([])).toBe("instance Array");
  });
  test("an object", () => {
    expect(type_of({})).toBe("instance Object");
  });
  test("an instance of a class", () => {
    expect(type_of(new FooBar())).toBe("instance FooBar");
  });
  test("undefined", () => {
    expect(type_of(undefined)).toBe("undefined");
  });
  test("true", () => {
    expect(type_of(true)).toBe("boolean");
  });
  test("false", () => {
    expect(type_of(false)).toBe("boolean");
  });
});

describe("is_class", () => {
  test("a string", () => {
    expect(is_class("foobar")).toBe(false);
  });
  test("a class", () => {
    expect(is_class(FooBar)).toBe(true);
  });
  test("a class with the right name", () => {
    expect(is_class(FooBar, "FooBar")).toBe(true);
  });
  test("a class with the wrong name", () => {
    expect(is_class(FooBar, "FooBarBaz")).toBe(false);
  });
  test("an instance", () => {
    expect(is_class(new FooBar())).toBe(false);
  });
});

describe("is_instance", () => {
  test("a string", () => {
    expect(is_instance("foobar")).toBe(false);
  });
  test("a class", () => {
    expect(is_instance(FooBar)).toBe(false);
  });
  test("an instance", () => {
    expect(is_instance(new FooBar())).toBe(true);
  });
  test("an instance with the right name", () => {
    expect(is_instance(new FooBar(), "FooBar")).toBe(true);
  });
  test("an instance with the wrong name", () => {
    expect(is_instance(new FooBar(), "FooBarBaz")).toBe(false);
  });
});
