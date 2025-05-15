import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useTheme } from "next-themes";

export function CodeEditor({
  value,
  onChange,
  onFocusLeave,
  height = "200px",
}: {
  value: string;
  onChange: (value: string) => void;
  onFocusLeave: (value: string) => void;
  height?: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <CodeMirror
      value={value}
      height={height}
      extensions={[javascript({ jsx: true })]}
      className="w-full"
      onChange={onChange}
      onBlur={() => onFocusLeave(value)}
      theme={resolvedTheme as "light" | "dark"}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
      suppressHydrationWarning
    />
  );
}
