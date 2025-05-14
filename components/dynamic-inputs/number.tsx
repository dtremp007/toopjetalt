import { z } from "zod";
import { DynamicInput } from "./types";
import { InputWithDrag } from "../ui/input-with-drag";

export default {
  Component: InputWithDrag,
  schema: z.object({
    label: z.string().optional(),
    min: z.number().default(0),
    max: z.number().default(100),
    step: z.number().default(1),
    defaultValue: z.number().default(0),
  }),
} satisfies DynamicInput;
