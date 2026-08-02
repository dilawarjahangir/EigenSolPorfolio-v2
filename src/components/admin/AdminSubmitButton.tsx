"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import styles from "./AdminUi.module.css";

type AdminSubmitButtonProps = Readonly<{
  children: React.ReactNode;
  pendingLabel: string;
  tone?: "primary" | "secondary" | "danger" | "ghost";
  name?: string;
  value?: string;
}>;

const classNames = {
  primary: styles.button,
  secondary: styles.buttonSecondary,
  danger: styles.buttonDanger,
  ghost: styles.buttonGhost,
} as const;

export function AdminSubmitButton({
  children,
  pendingLabel,
  tone = "primary",
  name,
  value,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={classNames[tone]}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      name={name}
      value={value}
    >
      {pending ? <LoaderCircle aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
