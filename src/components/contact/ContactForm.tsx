"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
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

const services = [
  "Custom Software Development",
  "Web Application Development",
  "Mobile App Development",
  "UI/UX Design",
  "Cloud & DevOps",
  "AI & Machine Learning",
  "Consulting",
  "Other",
];

const budgets = [
  ["<25k", "Less than $25,000"],
  ["25k-50k", "$25,000 - $50,000"],
  ["50k-100k", "$50,000 - $100,000"],
  ["100k-250k", "$100,000 - $250,000"],
  ["250k+", "$250,000+"],
];

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
  const [submitted, setSubmitted] = useState(false);

  const updateValue = (field: keyof FormValues, value: string) => {
    setSubmitted(false);
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const lines = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Company: ${values.company || "Not provided"}`,
      `Phone: ${values.phone || "Not provided"}`,
      `Service: ${values.service}`,
      `Budget: ${values.budget || "Not specified"}`,
      "",
      "Project details:",
      values.message,
    ];

    const subject = encodeURIComponent(`Project inquiry from ${values.name}`);
    const body = encodeURIComponent(lines.join("\n"));
    setSubmitted(true);
    window.location.href = `mailto:info@eigensol.com?subject=${subject}&body=${body}`;
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <Field label="Full Name" required>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
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
            {services.map((service) => (
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
            {budgets.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
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
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          placeholder="Tell us about your project, timeline, and requirements."
        />
      </Field>

      <button className={styles.submit} type="submit">
        Send Message
        <Send aria-hidden="true" />
      </button>
      <p className={styles.legal}>
        By submitting, you agree to our <Link href="/privacy-policy">privacy policy</Link> and{" "}
        <Link href="/terms-and-conditions">terms and conditions</Link>.
      </p>
      <p className={styles.status} aria-live="polite">
        {submitted ? "Your email application is opening with the project details included." : ""}
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
