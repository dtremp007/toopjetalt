import { Graph, topologicalSort } from "graph-data-structure";
import { Row, RowInput, RowOptions, type Value } from "./row";
import { nanoid } from "nanoid";

export type SpreadsheetOptions = {
  context?: Record<string, Value>;
  rows?: (Omit<RowOptions, "id" | "expr"> & { id?: string; expr?: string })[];
  onChange?: (e: SpreadsheetOnChangeEvent) => void;
};

export type SpreadsheetOnChangeEvent = {
  spreadsheet: Spreadsheet;
};

export type SerializedSpreadsheet = {
  rows: Array<{
    id: string;
    name: string;
    expr: string;
    value: Value;
    input: RowInput | undefined;
    dependencies: string[];
    tags: string[];
    error?: string;
  }>;
};

export class Spreadsheet {
  private rows = new Map<string, Row>();
  private graph = new Graph<string>();
  private eventListeners: ((e: SpreadsheetOnChangeEvent) => void)[] = [];
  private globalContext: Record<string, Value> = {};
  private _variableToIdMap: Map<string, string> | null = null;

  constructor(options?: SpreadsheetOptions) {
    const { context, onChange } = options ?? {};
    this.globalContext = context ?? {};
    if (onChange) {
      this.eventListeners.push(onChange);
    }

    for (const row of options?.rows ?? []) {
      this.addRow(row);
    }
    this.evaluateAll();
  }

  /**
   * Adds a new row with given name and expression.
   * Returns the generated row ID.
   */
  addRow(
    options: Omit<RowOptions, "id" | "expr"> & { id?: string; expr?: string }
  ): string {
    const id = options.id ?? nanoid();
    const row = new Row({ ...options, id, expr: options.expr ?? "" });
    this.rows.set(id, row);
    this.graph.addNode(id);

    this.evaluateAll();

    row.addEventListener("setInput", () => {
      this.evaluateAll();
    });

    row.addEventListener("updateExpression", () => {
      this.evaluateAll();
    });

    return id;
  }

  /** Removes a row by ID (and its dependencies). */
  removeRow(id: string): void {
    const row = this.rows.get(id);
    if (!row) return;
    this.rows.delete(id);
    this.graph.removeNode(id);
  }

  /** Renames a row and updates all expressions referencing the old name. */
  renameRow(id: string, newName: string): void {
    const row = this.rows.get(id);
    if (!row) return;
    const oldName = row.name;

    const filteredRows = Array.from(this.rows.values()).filter((r) =>
      r.getDependencies().map(this.mapVarToId()).includes(id)
    );

    // Update all expressions that reference $oldName → $newName
    for (const r of filteredRows) {
      r.updateExpression((expr) =>
        expr.replace(new RegExp(`\\$${oldName}\\b`, "g"), `$${newName}`)
      );
    }
  }

  updateInputValue(id: string, value: any): void {
    const row = this.rows.get(id);
    if (!row) return;
    row.setValue(value);
    this.evaluateAll();
  }

  getVariableMap(): Map<string, string> {
    if (this._variableToIdMap) return this._variableToIdMap;
    this._variableToIdMap = new Map<string, string>();

    for (const row of this.rows.values()) {
      this._variableToIdMap.set(row.name, row.id);
    }
    return this._variableToIdMap;
  }

  mapVarToId(): (name: string) => string | undefined {
    const map = this.getVariableMap();

    return (name: string) => map.get(name);
  }

  /** (Re)builds the internal dependency graph from current rows. */
  private buildGraph(): void {
    this.graph = new Graph<string>();
    // Add all nodes
    for (const id of this.rows.keys()) {
      this.graph.addNode(id);
    }
    // Add directed edges: dep → row
    for (const row of this.rows.values()) {
      for (const id of row
        .getDependencies()
        .map(this.mapVarToId())
        .filter(Boolean)) {
        this.graph.addEdge(id!, row.id);
      }
    }
  }

  /**
   * Evaluates all rows in dependency order.
   * Unresolved or circular deps yield `undefined` outputs.
   */
  evaluateAll(): void {
    this.buildGraph();
    const order = topologicalSort(this.graph);

    for (const id of order) {
      const row = this.rows.get(id);
      if (!row || !row.isSafe()) continue;

      const deps = row.getDependencies().map(this.mapVarToId()).filter(Boolean);
      const scope: Record<string, Value> = {};
      let skip = false;

      // Gather dependent values
      for (const id of deps) {
        const dep = this.rows.get(id!);

        if (!dep) {
          row.setValue(undefined);
          skip = true;
          break;
        }

        const val = dep.value;
        if (val === undefined) {
          row.setValue(undefined);
          skip = true;
          break;
        }
        scope[dep.name] = val;
      }
      if (skip) continue;

      try {
        row.evaluate({ ...this.globalContext, ...scope });
      } catch (error) {
        row.setValue(undefined);
        row.setError(error as Error);
      }
    }

    this.eventListeners.forEach((fn) => fn({ spreadsheet: this }));
  }

  /** Returns a snapshot of all current rows. */
  getRows(): Row[] {
    return Array.from(this.rows.values());
  }

  onChange(fn: (e: SpreadsheetOnChangeEvent) => void): void {
    this.eventListeners.push(fn);
  }

  /** Returns a serializable object representation of the spreadsheet */
  serialize(): SerializedSpreadsheet {
    return {
      rows: Array.from(this.rows.values()).map((row) => {
        const input = row.getInput();

        return {
        id: row.id,
        name: row.name,
        expr: row.getExpression(),
        value: row.getValue(),
        input: input
          ? {
              type: input.type,
              props: {
                ...input.props,
                defaultValue: row.getValue(),
              },
            }
          : undefined,
        dependencies: row
          .getDependencies()
          .map(this.mapVarToId())
          .filter(Boolean) as string[],
          tags: row.getTags(),
          error: row.getError()?.message,
        };
      }),
    };
  }

  /** Creates a new Spreadsheet instance from a serialized format */
  static deserialize(
    data: SerializedSpreadsheet,
    options: Omit<SpreadsheetOptions, "rows"> = {}
  ): Spreadsheet {
    const spreadsheet = new Spreadsheet({
      ...options,
      rows: data.rows.map((row) => ({
        id: row.id,
        name: row.name,
        expr: row.expr,
        input: row.input,
        tags: row.tags,
      })),
    });

    return spreadsheet;
  }
}
