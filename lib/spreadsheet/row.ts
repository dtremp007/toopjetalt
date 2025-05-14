import { Identifier, Node, parse } from "acorn";
import { type Program } from "acorn";
import { extractMaliciousCode, evaluate } from "./evaluate";
import { MaliciousCodeError } from "./errors";

/** Any Javascript type */
export type Value =
  | number
  | string
  | boolean
  | null
  | undefined
  | object
  | Function;

export type ValueType =
  | "number"
  | "string"
  | "boolean"
  | "null"
  | "undefined"
  | "object"
  | "function"
  | "array"
  | "error";

export type RowInput = {
  type: string;
  props: {
    name: string;
    defaultValue?: any;
    [key: string]: any;
  };
};

export type RowOptions = {
  id: string;
  name: string;
  expr: string;
  input?: RowInput;
  tags?: string[];
};

export class Row extends EventTarget {
  id: string;
  name: string;
  private expr: string;
  value: Value;
  private dependencies: string[] = [];
  private AST: Program;
  private input?: RowInput;
  private error?: Error;
  private maliciousCode?: Identifier[];
  private tags: string[];

  constructor(options: RowOptions) {
    super();

    this.id = options.id;
    this.name = options.name;
    this.expr = options.expr;
    this.AST = parse(options.expr, { ecmaVersion: "latest" });
    this.maliciousCode = extractMaliciousCode(this.AST);
    this.input = options.input;
    this.value = options.input?.props.defaultValue;
    this.tags = options.tags || [];

    if (this.maliciousCode.length > 0) {
      this.error = createMaliciousCodeError(this.maliciousCode);
    }
  }

  public evaluate(context: Record<string, Value>): Value {
    if (this.input) {
      return this.value;
    }

    const result = evaluate(this.expr, context);
    this.value = result;
    return result;
  }

  public getValue(): Value {
    return this.value;
  }

  public setValue(value: Value): void {
    this.value = value;
  }

  public getInput(): RowInput | undefined {
    return this.input;
  }

  private clearExpression(): void {
    this.expr = "";
    this.AST = parse("", { ecmaVersion: "latest" });
    this.maliciousCode = [];
    this.error = undefined;
    this.dependencies = [];
  }

  public setInput(input: RowInput): void {
    this.clearExpression();

    this.value = input.props.defaultValue;
    this.input = input;

    this.dispatchEvent(new Event("setInput"));
  }

  public getExpression(): string {
    return this.expr;
  }

  public getDependencies(): string[] {
    if (this.dependencies.length > 0) {
      return this.dependencies;
    }

    const identifiers: string[] = [];

    const traverse = (node: any) => {
      if (node.type === "Identifier") {
        identifiers.push(node.name);
      }

      // Recursively traverse all child nodes
      for (const key in node) {
        if (node[key] && typeof node[key] === "object") {
          if (Array.isArray(node[key])) {
            node[key].forEach(traverse);
          } else {
            traverse(node[key]);
          }
        }
      }
    };

    // Start traversal from the AST root
    traverse(this.AST);

    this.dependencies = [...new Set(identifiers)];

    // Remove duplicates and return
    return this.dependencies;
  }

  public getValueType(): ValueType {
    if (this.error) {
      return "error";
    }

    if (Array.isArray(this.value)) {
      return "array";
    }

    return typeof this.value as ValueType;
  }

  public updateExpression(expr: string | ((expr: string) => string)): void {
    this.error = undefined;
    this.dependencies = []

    this.expr = typeof expr === "function" ? expr(this.expr) : expr;
    this.AST = parse(this.expr, { ecmaVersion: "latest" });
    this.maliciousCode = extractMaliciousCode(this.AST);

    if (this.maliciousCode.length > 0) {
      this.error = createMaliciousCodeError(this.maliciousCode);
      this.value = undefined;
    }

    this.dispatchEvent(new Event("updateExpression"));
  }

  public getAST(): Program {
    return this.AST;
  }

  public getError(): Error | undefined {
    return this.error;
  }

  public setError(error: Error): void {
    this.error = error;
  }

  public isSafe(): boolean {
    return this.maliciousCode?.length === 0;
  }

  public getTags(): string[] {
    return this.tags;
  }

  public setTags(tags: string[]): void {
    this.tags = tags;
  }

  public removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }
}

function createMaliciousCodeError(maliciousCode: Identifier[]): Error {
  return new MaliciousCodeError(
    "You are not allowed to use these functions: " +
      maliciousCode.map((node) => node.name).join(", ")
  );
}
