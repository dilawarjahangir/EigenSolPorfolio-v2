import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import type { BlogCommentModerationNotification } from "@/contracts/blog-comments";
import type { ProjectInquirySubmission } from "./form-submission";

let transporter: Transporter | undefined;

type MailConfiguration = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing mail configuration: ${name}`);
  }

  return value;
}

function getMailConfiguration(): MailConfiguration {
  const port = Number(requiredEnvironmentVariable("ZOHO_SMTP_PORT"));

  if (port !== 465 && port !== 587) {
    throw new Error("Invalid mail configuration: ZOHO_SMTP_PORT");
  }

  const user = requiredEnvironmentVariable("ZOHO_SMTP_USER");

  return {
    host: requiredEnvironmentVariable("ZOHO_SMTP_HOST"),
    port,
    user,
    password: requiredEnvironmentVariable("ZOHO_SMTP_PASS"),
    from: process.env.CONTACT_FROM_EMAIL?.trim() || user,
  };
}

function getTransporter(configuration: MailConfiguration) {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.port === 465,
    requireTLS: configuration.port === 587,
    auth: {
      user: configuration.user,
      pass: configuration.password,
    },
    connectionTimeout: 6_000,
    greetingTimeout: 6_000,
    socketTimeout: 15_000,
    dnsTimeout: 5_000,
    logger: false,
    debug: false,
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  return transporter;
}

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

async function sendMail(
  configuration: MailConfiguration,
  kind: "admin-password-reset" | "blog-comment" | "project-inquiry",
  message: Parameters<Transporter["sendMail"]>[0],
) {
  const mailer = getTransporter(configuration);
  const delivery = await mailer.sendMail(message);
  const acceptedCount = Array.isArray(delivery.accepted) ? delivery.accepted.length : null;
  const rejectedCount = Array.isArray(delivery.rejected) ? delivery.rejected.length : null;

  if (acceptedCount === 0) {
    const error = new Error("The SMTP server did not accept the recipient.");
    Object.assign(error, { code: "ESMTPNOACCEPT" });
    throw error;
  }

  console.info("Website email accepted by SMTP", {
    kind,
    acceptedCount,
    rejectedCount,
  });
}

function projectInquiryText(submission: ProjectInquirySubmission) {
  return [
    "A project inquiry was submitted through eigensol.com.",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company || "Not provided"}`,
    `Phone: ${submission.phone || "Not provided"}`,
    `Service: ${submission.service}`,
    `Budget: ${submission.budget || "Not provided"}`,
    "",
    "Project details:",
    submission.message,
  ].join("\n");
}

function blogCommentModerationText(notification: BlogCommentModerationNotification) {
  return [
    "A blog comment was submitted for moderation through eigensol.com.",
    "",
    `Article: ${notification.postTitle}`,
    `Article URL: https://eigensol.com/blogs/${notification.postSlug}`,
    `Name: ${notification.authorName}`,
    `Email: ${notification.authorEmail}`,
    `Website: ${notification.websiteUrl || "Not provided"}`,
    `Submitted: ${notification.createdAt}`,
    "",
    "Comment:",
    notification.body,
    "",
    "Review this comment:",
    notification.moderationUrl,
    "",
    "This private link expires after seven days and can be used only once.",
  ].join("\n");
}

export async function sendProjectInquiryEmail(submission: ProjectInquirySubmission) {
  const configuration = getMailConfiguration();

  await sendMail(configuration, "project-inquiry", {
    from: {
      name: "EigenSol Website",
      address: configuration.from,
    },
    to: requiredEnvironmentVariable("CONTACT_TO_EMAIL"),
    replyTo: {
      name: singleLine(submission.name),
      address: submission.email,
    },
    subject: `Website project inquiry from ${singleLine(submission.name)}`,
    text: projectInquiryText(submission),
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export async function sendBlogCommentModerationEmail(
  notification: BlogCommentModerationNotification,
) {
  const configuration = getMailConfiguration();

  await sendMail(configuration, "blog-comment", {
    from: {
      name: "EigenSol Website",
      address: configuration.from,
    },
    to: requiredEnvironmentVariable("CONTACT_TO_EMAIL"),
    replyTo: {
      name: singleLine(notification.authorName),
      address: notification.authorEmail,
    },
    subject: `Blog comment awaiting moderation: ${singleLine(notification.postTitle)}`,
    text: blogCommentModerationText(notification),
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export async function sendAdminPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}) {
  const configuration = getMailConfiguration();

  await sendMail(configuration, "admin-password-reset", {
    from: {
      name: "EigenSol Admin",
      address: configuration.from,
    },
    to: email,
    subject: "Reset your EigenSol admin password",
    text: [
      "A password reset was requested for the EigenSol admin account.",
      "",
      "Reset your password:",
      resetUrl,
      "",
      "This link expires in 30 minutes. If you did not request it, you can ignore this email.",
    ].join("\n"),
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}
