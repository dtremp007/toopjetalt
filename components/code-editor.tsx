import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useTheme } from "next-themes";

export function CodeEditor({
  defaultValue,
  onFocusLeave,
  height = "200px",
}: {
  defaultValue: string;
  onFocusLeave: (value: string) => void;
  height?: string;
}) {
  const { theme } = useTheme();

  const [value, setValue] = React.useState(defaultValue);
  const onChange = React.useCallback((val: string) => {
    setValue(val);
  }, []);
  return (
    <CodeMirror
      value={value}
      height={height}
      extensions={[javascript({ jsx: true })]}
      className="w-full"
      onChange={onChange}
      onBlur={() => onFocusLeave(value)}
      theme={theme as "light" | "dark"}
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
