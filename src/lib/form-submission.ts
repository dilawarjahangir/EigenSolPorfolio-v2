export const projectServices = [
  "Custom Software Development",
  "Web Application Development",
  "Mobile App Development",
  "UI/UX Design Systems",
  "Cloud & DevOps",
  "AI & Machine Learning",
  "Consulting",
  "Other",
] as const;

export const projectBudgets = [
  "Less than $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "$250,000+",
] as const;

type SubmissionBase = {
  name: string;
  email: string;
  companyUrl: string;
};

export type ProjectInquirySubmission = SubmissionBase & {
  kind: "project-inquiry";
  company: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
};

export type BlogCommentSubmission = SubmissionBase & {
  kind: "blog-comment";
  website: string;
  comment: string;
  postSlug: string;
};

export type WebsiteFormSubmission = ProjectInquirySubmission | BlogCommentSubmission;

type FormSubmissionResponse = {
  ok?: boolean;
  message?: string;
};

export async function submitWebsiteForm(payload: WebsiteFormSubmission) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);

  try {
    const response = await fetch("/api/forms", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });
    const result = (await response.json().catch(() => null)) as FormSubmissionResponse | null;

    if (!response.ok) {
      throw new Error(result?.message || "We couldn't send your message. Please try again.");
    }

    return { status: response.status };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The request timed out. Please check your connection and try again.");
    }

    if (error instanceof Error && !error.message.toLowerCase().includes("fetch")) {
      throw error;
    }

    throw new Error("We couldn't reach the server. Please check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }
}
