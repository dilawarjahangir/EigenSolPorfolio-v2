"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import styles from "./AdminUi.module.css";

type AdminConfirmButtonProps = Readonly<{
  children: React.ReactNode;
  confirmation: string;
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

export function AdminConfirmButton({
  children,
  confirmation,
  pendingLabel,
  tone = "danger",
  name,
  value,
}: AdminConfirmButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={classNames[tone]}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      name={name}
      value={value}
      onClick={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
    >
      {pending ? <LoaderCircle aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
