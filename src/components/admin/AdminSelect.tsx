"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import styles from "./AdminSelect.module.css";

export type AdminSelectOption = Readonly<{
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}>;

export type AdminSelectProps = Readonly<{
  id?: string;
  name?: string;
  label: string;
  options: readonly AdminSelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  describedBy?: string;
  disabled?: boolean;
  required?: boolean;
  hideLabel?: boolean;
  size?: "default" | "compact";
  className?: string;
  onValueChange?: (value: string) => void;
}>;

const TYPEAHEAD_RESET_DELAY = 600;

function joinIds(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

export function AdminSelect({
  id,
  name,
  label,
  options,
  value,
  defaultValue = "",
  placeholder = "Select an option",
  description,
  error,
  describedBy,
  disabled = false,
  required = false,
  hideLabel = false,
  size = "default",
  className,
  onValueChange,
}: AdminSelectProps) {
  const reactId = useId().replace(/:/g, "");
  const controlId = id ?? `admin-select-${reactId}`;
  const labelId = `${controlId}-label`;
  const listboxId = `${controlId}-listbox`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const searchRef = useRef("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlled ? value : internalValue;
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const enabledIndices = useMemo(
    () => options.flatMap((option, index) => (option.disabled ? [] : [index])),
    [options],
  );
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 && !options[selectedIndex]?.disabled
      ? selectedIndex
      : (enabledIndices[0] ?? -1),
  );

  const activeOptionId =
    open && activeIndex >= 0 ? `${controlId}-option-${activeIndex}` : undefined;

  const commitValue = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;

    if (!controlled) setInternalValue(option.value);
    setActiveIndex(index);
    setOpen(false);
    onValueChange?.(option.value);
    controlRef.current?.focus();
  };

  const openListbox = (fallback: "first" | "last" = "first") => {
    if (disabled || !enabledIndices.length) return;
    const controlBounds = controlRef.current?.getBoundingClientRect();
    if (controlBounds) {
      const spaceBelow = window.innerHeight - controlBounds.bottom;
      const spaceAbove = controlBounds.top;
      setPlacement(spaceBelow < 240 && spaceAbove > spaceBelow ? "above" : "below");
    }
    const currentIndex =
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : fallback === "last"
          ? enabledIndices[enabledIndices.length - 1]
          : enabledIndices[0];

    setActiveIndex(currentIndex ?? -1);
    setOpen(true);
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (!enabledIndices.length) return;
    const currentPosition = enabledIndices.indexOf(activeIndex);
    const nextPosition =
      currentPosition < 0
        ? direction === 1
          ? 0
          : enabledIndices.length - 1
        : (currentPosition + direction + enabledIndices.length) % enabledIndices.length;
    setActiveIndex(enabledIndices[nextPosition] ?? -1);
  };

  const findTypeaheadMatch = (search: string) => {
    if (!search || !enabledIndices.length) return -1;
    const activePosition = enabledIndices.indexOf(activeIndex);
    const orderedIndices = [
      ...enabledIndices.slice(activePosition + 1),
      ...enabledIndices.slice(0, activePosition + 1),
    ];
    return (
      orderedIndices.find((index) =>
        options[index]?.label.toLocaleLowerCase().startsWith(search.toLocaleLowerCase()),
      ) ?? -1
    );
  };

  const handleTypeahead = (key: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const previousSearch = searchRef.current;
    const repeatedCharacter =
      previousSearch.length > 0 && [...previousSearch].every((character) => character === key);
    searchRef.current = repeatedCharacter ? key : `${previousSearch}${key}`;
    searchTimerRef.current = setTimeout(() => {
      searchRef.current = "";
    }, TYPEAHEAD_RESET_DELAY);

    const match = findTypeaheadMatch(searchRef.current);
    if (match < 0) return;
    if (open) setActiveIndex(match);
    else commitValue(match);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) moveActiveOption(1);
        else openListbox("first");
        return;
      case "ArrowUp":
        event.preventDefault();
        if (open) moveActiveOption(-1);
        else openListbox("last");
        return;
      case "Home":
        event.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(enabledIndices[0] ?? -1);
        return;
      case "End":
        event.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open && activeIndex >= 0) commitValue(activeIndex);
        else openListbox("first");
        return;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          handleTypeahead(event.key.toLocaleLowerCase());
        }
    }
  };

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const activeOption = optionRefs.current[activeIndex];
    if (activeOption && "scrollIntoView" in activeOption) {
      activeOption.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form || controlled) return;
    const resetValue = () => {
      setInternalValue(defaultValue);
      const resetIndex = options.findIndex((option) => option.value === defaultValue);
      setActiveIndex(resetIndex >= 0 ? resetIndex : (enabledIndices[0] ?? -1));
      setOpen(false);
    };
    form.addEventListener("reset", resetValue);
    return () => form.removeEventListener("reset", resetValue);
  }, [controlled, defaultValue, enabledIndices, options]);

  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    [],
  );

  return (
    <div
      className={[styles.field, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={error ? "true" : undefined}
      data-size={size}
      ref={rootRef}
    >
      <span className={hideLabel ? styles.visuallyHidden : styles.label} id={labelId}>
        {label}
        {required ? <span className={styles.required}>Required</span> : null}
      </span>
      {name ? <input disabled={disabled} name={name} type="hidden" value={selectedValue} /> : null}
      <div className={styles.control}>
        <button
          className={styles.trigger}
          id={controlId}
          type="button"
          role="combobox"
          disabled={disabled}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="none"
          aria-controls={listboxId}
          aria-describedby={joinIds(describedBy, descriptionId, errorId)}
          aria-errormessage={errorId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={error ? "true" : undefined}
          aria-labelledby={labelId}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          data-open={open ? "true" : undefined}
          data-placeholder={selectedOption ? undefined : "true"}
          ref={controlRef}
          onClick={() => {
            if (disabled) return;
            if (open) setOpen(false);
            else openListbox("first");
          }}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false);
          }}
        >
          <span className={styles.value}>{selectedOption?.label ?? placeholder}</span>
          <ChevronsUpDown aria-hidden="true" />
        </button>

        {open ? (
          <div
            className={styles.listbox}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            data-placement={placement}
          >
            {options.length ? (
              options.map((option, index) => (
                <button
                  className={styles.option}
                  id={`${controlId}-option-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-disabled={option.disabled || undefined}
                  aria-selected={selectedIndex === index}
                  data-active={activeIndex === index ? "true" : undefined}
                  disabled={option.disabled}
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  onClick={() => commitValue(index)}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  onPointerDown={(event) => event.preventDefault()}
                >
                  <span>
                    <strong>{option.label}</strong>
                    {option.description ? <small>{option.description}</small> : null}
                  </span>
                  <Check aria-hidden="true" data-visible={selectedIndex === index ? "true" : undefined} />
                </button>
              ))
            ) : (
              <span className={styles.empty}>No options available</span>
            )}
          </div>
        ) : null}
      </div>
      {description ? (
        <span className={styles.description} id={descriptionId}>
          {description}
        </span>
      ) : null}
      {error ? (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
