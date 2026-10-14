import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

interface MFAInputProps {
  length?: number;
  onChange: (value: string) => void;
  value: string;
  disabled?: boolean;
}

const toDigits = (value: string, length: number) =>
  Array.from({ length }, (_, i) => value[i] ?? "");

const MFAInput: React.FC<MFAInputProps> = ({
  length = 8,
  onChange,
  value,
  disabled,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(() => toDigits(value, length));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDigits((current) =>
      current.join("") === value ? current : toDigits(value, length),
    );
  }, [value, length]);

  const emit = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  const setDigitAt = (idx: number, digit: string) => {
    const next = [...digits];
    next[idx] = digit;
    emit(next);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    setDigitAt(idx, val[val.length - 1]);
    focusAfterEntry(idx);
  };

  const focusAfterEntry = (idx: number) => {
    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    } else {
      inputsRef.current[idx]?.select();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (/^[0-9]$/.test(e.key)) {
      setDigitAt(idx, e.key);
      focusAfterEntry(idx);
      e.preventDefault();
    } else if (e.key === "Backspace") {
      if (digits[idx]) {
        setDigitAt(idx, "");
      } else if (idx > 0) {
        setDigitAt(idx - 1, "");
        inputsRef.current[idx - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "Delete") {
      setDigitAt(idx, "");
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  // Handle paste event for all boxes
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (paste.length > 0) {
      emit(toDigits(paste, length));
      // Focus the last filled box
      setTimeout(() => {
        inputsRef.current[Math.min(paste.length, length) - 1]?.focus();
      }, 0);
      e.preventDefault();
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {Array.from({ length }).map((_, idx) => (
        <TextField
          key={idx}
          inputRef={(el) => {
            inputsRef.current[idx] = el;
          }}
          value={digits[idx] ?? ""}
          onFocus={(e) => e.target.select()}
          onChange={(e) =>
            handleChange(e as React.ChangeEvent<HTMLInputElement>, idx)
          }
          onKeyDown={(e) =>
            handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, idx)
          }
          onPaste={handlePaste}
          disabled={disabled}
          slotProps={{
            htmlInput: {
              maxLength: 1,
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: {
                textAlign: "center",
                fontSize: 28,
                height: 48,
                width: 48,
                padding: 0,
                lineHeight: 1,
                verticalAlign: "middle",
                boxSizing: "border-box",
              },
            },
          }}
          variant="outlined"
          sx={{
            width: 48,
            height: 48,
            "& .MuiInputBase-root": {
              height: 48,
              width: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
            },
            "& .MuiInputBase-input": {
              textAlign: "center",
              fontSize: 28,
              height: 48,
              width: 48,
              p: 0,
              m: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
          autoFocus={idx === 0}
        />
      ))}
    </Box>
  );
};

export default MFAInput;
