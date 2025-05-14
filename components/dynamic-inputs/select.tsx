import { SelectWithOptions } from "../ui/select-with-options";
import { DynamicInput } from "./types";
import { z } from "zod";

export default {
  Component: SelectWithOptions,
  schema: z.object({
    options: z.array(z.string()),
    placeholder: z.string().default("Select an option"),
  }),
} satisfies DynamicInput;
