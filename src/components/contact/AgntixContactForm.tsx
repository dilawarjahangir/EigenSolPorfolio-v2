"use client";

import { useState, type FormEvent } from "react";
import {
  projectBudgets,
  projectServices,
  submitWebsiteForm,
} from "@/lib/form-submission";
import styles from "./AgntixContactPage.module.css";

type AgntixContactFormProps = {
  defaultMessage?: string;
};

type ContactValues = {
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

export default function AgntixContactForm({
  defaultMessage = "",
}: AgntixContactFormProps) {
  const [values, setValues] = useState<ContactValues>({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    budget: "",
    message: defaultMessage,
  });
  const [status, setStatus] = useState<SubmissionStatus>({ state: "idle", message: "" });

  const updateValue = (field: keyof ContactValues, value: string) => {
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
      className={styles.contactForm}
      method="post"
      onSubmit={handleSubmit}
      aria-busy={status.state === "submitting"}
    >
      <label className={styles.formTrap} htmlFor="contact-company-url" aria-hidden="true">
        <span>Leave this field empty</span>
        <input
          id="contact-company-url"
          name="companyUrl"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      <div className={styles.formGrid}>
        <label className={styles.formField} htmlFor="contact-name">
          <span>Full name*</span>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
          />
        </label>

        <label className={styles.formField} htmlFor="contact-email">
          <span>Email address*</span>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
          />
        </label>

        <label
          className={`${styles.formField} ${styles.formFieldWide}`}
          htmlFor="contact-company"
        >
          <span>Company name</span>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={160}
            value={values.company}
            onChange={(event) => updateValue("company", event.target.value)}
          />
        </label>

        <label className={styles.formField} htmlFor="contact-phone">
          <span>Phone number</span>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={50}
            value={values.phone}
            onChange={(event) => updateValue("phone", event.target.value)}
          />
        </label>

        <label className={styles.formField} htmlFor="contact-service">
          <span>Service interested in*</span>
          <select
            id="contact-service"
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
        </label>

        <label
          className={`${styles.formField} ${styles.formFieldWide}`}
          htmlFor="contact-budget"
        >
          <span>Project budget</span>
          <select
            id="contact-budget"
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
        </label>

        <label
          className={`${styles.formField} ${styles.formFieldWide}`}
          htmlFor="contact-message"
        >
          <span>How can we help you*</span>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={20}
            maxLength={5000}
            value={values.message}
            onChange={(event) => updateValue("message", event.target.value)}
          />
        </label>
      </div>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={status.state === "submitting"}
      >
        <span>
          <span>{status.state === "submitting" ? "Sending…" : "Send Message"}</span>
          <span aria-hidden="true">
            {status.state === "submitting" ? "Sending…" : "Send Message"}
          </span>
        </span>
      </button>
      <p className={styles.formStatus} data-state={status.state} aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}
