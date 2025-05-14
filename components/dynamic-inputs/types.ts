import { z } from "zod";

export type Field = {
  type: string;
  props: Record<string, any>;
};

export type DynamicInput = {
  Component: React.ComponentType<any>;
  /** These fields are used to render form where the user can configure the input */
  schema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>;
};
