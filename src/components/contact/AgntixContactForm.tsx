"use client";

import { useState, type FormEvent } from "react";
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

const services = [
  "Custom Software Development",
  "Web Application Development",
  "Mobile App Development",
  "UI/UX Design Systems",
  "Cloud & DevOps",
  "AI & Machine Learning",
  "Consulting",
  "Other",
] as const;

const budgetOptions = [
  "Less than $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "$250,000+",
] as const;

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
  const [submitted, setSubmitted] = useState(false);

  const updateValue = (field: keyof ContactValues, value: string) => {
    setSubmitted(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const subject = encodeURIComponent(`Project inquiry from ${values.name}`);
    const body = encodeURIComponent(
      [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Company: ${values.company || "Not provided"}`,
        `Phone: ${values.phone || "Not provided"}`,
        `Service: ${values.service}`,
        `Budget: ${values.budget || "Not provided"}`,
        "",
        "How EigenSol can help:",
        values.message,
      ].join("\n"),
    );

    setSubmitted(true);
    window.location.href = `mailto:info@eigensol.com?subject=${subject}&body=${body}`;
  };

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <label className={styles.formField} htmlFor="contact-name">
          <span>Full name*</span>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
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
            {services.map((service) => (
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
            {budgetOptions.map((budget) => (
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
            value={values.message}
            onChange={(event) => updateValue("message", event.target.value)}
          />
        </label>
      </div>

      <button className={styles.submitButton} type="submit">
        <span>
          <span>Send Message</span>
          <span aria-hidden="true">Send Message</span>
        </span>
      </button>
      <p className={styles.formStatus} aria-live="polite">
        {submitted ? "Opening your email application with the project details included." : ""}
      </p>
    </form>
  );
}
