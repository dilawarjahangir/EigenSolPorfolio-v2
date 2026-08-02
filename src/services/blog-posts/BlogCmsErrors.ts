export type BlogCmsErrorCode =
  | "invalid-input"
  | "post-not-found"
  | "revision-not-found"
  | "media-not-found"
  | "schedule-not-found"
  | "version-conflict"
  | "slug-conflict"
  | "media-conflict"
  | "media-referenced"
  | "active-schedule"
  | "invalid-state";

export class BlogCmsValidationError extends Error {
  readonly code = "invalid-input" as const;
}

export class BlogCmsNotFoundError extends Error {
  constructor(
    message: string,
    public readonly code: Extract<
      BlogCmsErrorCode,
      "post-not-found" | "revision-not-found" | "media-not-found" | "schedule-not-found"
    >,
  ) {
    super(message);
  }
}

export class BlogCmsConflictError extends Error {
  constructor(
    message: string,
    public readonly code: Extract<
      BlogCmsErrorCode,
      | "version-conflict"
      | "slug-conflict"
      | "media-conflict"
      | "media-referenced"
      | "active-schedule"
      | "invalid-state"
    >,
    public readonly actualVersion?: number,
  ) {
    super(message);
  }
}
