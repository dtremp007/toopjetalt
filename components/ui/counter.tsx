import { Minus } from "lucide-react";
import { Plus } from "lucide-react";
import React from "react";

export function Counter(props: React.ComponentProps<"input"> & { label?: string }) {
  const [value, setValue] = React.useState(+(props.defaultValue || 0));

  const handleIncrement = () => {
    setValue((prevValue) => prevValue + 1);
  };

  const handleDecrement = () => {
    setValue((prevValue) => Math.max(prevValue - 1, 0));
  };

  return (
    <div className="flex items-center justify-between">
      {props.label && (
        <label htmlFor={props.id} className="">
          {props.label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <button
          className="rounded-full border border-border p-2 active:translate-y-px"
          onClick={handleDecrement}
          tabIndex={-1}
        >
          <Minus />
        </button>
        <input
          id={props.id}
          type="text"
          inputMode="numeric"
          name={props.name}
          value={value}
          onChange={(e) => setValue(+(e.target.value || 0))}
          className="w-16 border-none text-center text-lg font-bold focus:outline-none focus:ring-0"
          max={props.max}
          min={props.min}
        />
        <button
          className="rounded-full border border-border p-2 active:translate-y-px"
          onClick={handleIncrement}
          tabIndex={-1}
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}
