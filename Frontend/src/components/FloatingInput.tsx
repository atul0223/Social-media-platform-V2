import { useState } from "react";

const FloatingInput = ({
  label,
  type = "text",
  error,
  helperText,
  value,
  onChange,
  readOnly
}: {
  label: string;
  type?: string;
  error?: string;
  helperText?: string;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || value;

  return (
    <div className="relative w-full mb-3">
      <input
        type={type}
        autoFocus
        value={value}
        readOnly={readOnly}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required
        className={`
          w-full px-3 py-4 bg-transparent border-2 rounded-xl outline-none transition-colors duration-200
          ${
            error
              ? "border-red-500 focus:border-red-600"
              : isFocused
              ? "border-black"
              : "border-gray-400 hover:border-gray-700"
          }
        `}
      />

      {/* Label with border break effect */}
      <label
        className={`
        absolute left-3 px-1 bg-neutral-200 transition-all duration-200 pointer-events-none
        ${
          isActive
            ? `-top-2.5 text-xs ${
                error
                  ? "text-red-600"
                  : isFocused
                  ? "text-gray-900"
                  : "text-gray-600"
              }`
            : "top-4 text-base text-gray-500"
        }
      `}
      >
        {label}
      </label>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          className={`mt-1 text-xs ${error ? "text-red-500" : "text-gray-500"}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
export default FloatingInput;
