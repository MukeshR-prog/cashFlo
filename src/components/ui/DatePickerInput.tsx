"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  addMonths,
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toDisplayDate(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function parseInputDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidates = [
    parse(trimmed, "yyyy-MM-dd", new Date()),
    parse(trimmed, "MMMM dd, yyyy", new Date()),
    parse(trimmed, "MMM d, yyyy", new Date()),
    new Date(trimmed),
  ];

  for (const date of candidates) {
    if (isValid(date)) {
      return date;
    }
  }

  return null;
}

export function DatePickerInput({
  value,
  onChange,
  id,
  placeholder = "Select date",
  className,
  inputClassName,
  required,
  disabled,
  ariaLabel,
  title,
}: DatePickerInputProps) {
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  }, [value]);

  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(selectedDate ?? new Date());
  const [inputValue, setInputValue] = React.useState(toDisplayDate(selectedDate));

  React.useEffect(() => {
    setInputValue(toDisplayDate(selectedDate));
    if (selectedDate) {
      setMonth(selectedDate);
    }
  }, [selectedDate]);

  const selectDate = (date: Date) => {
    onChange(toIsoDate(date));
    setInputValue(toDisplayDate(date));
    setMonth(date);
  };

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const list: Date[] = [];
    let current = start;

    while (current <= end) {
      list.push(current);
      current = addDays(current, 1);
    }

    return list;
  }, [month]);

  return (
    <div className={cx("relative w-full", className)}>
      <div
        className={cx(
          "flex h-9 w-full items-center overflow-hidden rounded-xl border border-input bg-card text-sm text-foreground shadow-sm transition-all",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
          disabled && "opacity-60"
        )}
      >
        <input
          id={id}
          value={inputValue}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          title={title}
          onChange={(e) => {
            const next = e.target.value;
            setInputValue(next);
            const parsed = parseInputDate(next);
            if (parsed) {
              onChange(toIsoDate(parsed));
              setMonth(parsed);
            }
          }}
          onBlur={() => {
            if (!inputValue.trim()) {
              onChange("");
              return;
            }
            const parsed = parseInputDate(inputValue);
            if (parsed) {
              const normalized = toDisplayDate(parsed);
              setInputValue(normalized);
              onChange(toIsoDate(parsed));
            } else {
              setInputValue(toDisplayDate(selectedDate));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cx(
            "h-full flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground",
            inputClassName
          )}
        />

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="grid h-full w-9 shrink-0 place-items-center border-l border-input text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Select date"
              disabled={disabled}
            >
              <CalendarIcon size={16} strokeWidth={2} />
              <span className="sr-only">Select date</span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              alignOffset={-8}
              sideOffset={8}
              className="z-250 w-62 overflow-hidden rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl outline-none"
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMonth((current) => addMonths(current, -1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={15} />
                </button>

                <p className="text-sm font-semibold text-foreground">{format(month, "MMMM yyyy")}</p>

                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMonth((current) => addMonths(current, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                  <span
                    key={label}
                    className="grid h-7 place-items-center text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const inMonth = isSameMonth(day, month);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        selectDate(day);
                        setOpen(false);
                      }}
                      className={cx(
                        "grid h-8 place-items-center rounded-md text-sm transition-colors",
                        inMonth
                          ? "text-foreground hover:bg-muted"
                          : "text-muted-foreground/60 hover:bg-muted/60",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                      )}
                      aria-label={format(day, "MMMM d, yyyy")}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
