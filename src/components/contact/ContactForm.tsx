"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import {
  projectBudgets,
  projectServices,
  submitWebsiteForm,
} from "@/lib/form-submission";
import styles from "./ContactForm.module.css";

type ContactFormProps = {
  defaultMessage?: string;
};

type FormValues = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
};

type SubmissionStatus = {
  state: "idle" | "submitting" | "success" | "error";
  message: string;
};

export default function ContactForm({ defaultMessage = "" }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    budget: "",
    message: defaultMessage,
  });
  const [status, setStatus] = useState<SubmissionStatus>({ state: "idle", message: "" });

  const updateValue = (field: keyof FormValues, value: string) => {
    setStatus({ state: "idle", message: "" });
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    setStatus({ state: "submitting", message: "Sending your message…" });

    try {
      await submitWebsiteForm({
        kind: "project-inquiry",
        ...values,
        companyUrl: String(formData.get("companyUrl") || ""),
      });
      setValues({
        name: "",
        email: "",
        company: "",
        phone: "",
        service: "",
        budget: "",
        message: "",
      });
      form.reset();
      setStatus({
        state: "success",
        message: "Thanks — your project inquiry has been sent. We'll be in touch shortly.",
      });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "We couldn't send your message.",
      });
    }
  };

  return (
    <form
      className={styles.form}
      method="post"
      onSubmit={handleSubmit}
      aria-busy={status.state === "submitting"}
    >
      <label className={styles.formTrap} htmlFor="legacy-contact-company-url" aria-hidden="true">
        <span>Leave this field empty</span>
        <input
          id="legacy-contact-company-url"
          name="companyUrl"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      <div className={styles.grid}>
        <Field label="Full Name" required>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            placeholder="John Doe"
          />
        </Field>
        <Field label="Email Address" required>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            placeholder="john@company.com"
          />
        </Field>
        <Field label="Company Name">
          <input
            type="text"
            name="company"
            autoComplete="organization"
            maxLength={160}
            value={values.company}
            onChange={(event) => updateValue("company", event.target.value)}
            placeholder="Your company"
          />
        </Field>
        <Field label="Phone Number">
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            maxLength={50}
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
            placeholder="+92 300 0000000"
          />
        </Field>
        <Field label="Service Interested In" required>
          <select
            name="service"
            required
            value={values.service}
            onChange={(event) => updateValue("service", event.target.value)}
          >
            <option value="" disabled>
              Select a service
            </option>
            {projectServices.map((service) => (
              <option value={service} key={service}>
                {service}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Project Budget">
          <select
            name="budget"
            value={values.budget}
            onChange={(event) => updateValue("budget", event.target.value)}
          >
            <option value="">Select budget range</option>
            {projectBudgets.map((budget) => (
              <option value={budget} key={budget}>
                {budget}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Project Details" required>
        <textarea
          name="message"
          rows={7}
          required
          minLength={20}
          maxLength={5000}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          placeholder="Tell us about your project, timeline, and requirements."
        />
      </Field>

      <button className={styles.submit} type="submit" disabled={status.state === "submitting"}>
        {status.state === "submitting" ? "Sending…" : "Send Message"}
        <Send aria-hidden="true" />
      </button>
      <p className={styles.legal}>
        By submitting, you agree to our <Link href="/privacy-policy">privacy policy</Link> and{" "}
        <Link href="/terms-and-conditions">terms and conditions</Link>.
      </p>
      <p className={styles.status} data-state={status.state} aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
