export type AdminActionFieldError = Readonly<{
  field: string;
  message: string;
}>;

export type AdminPostActionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{
      status: "validation";
      message: string;
      fieldErrors: readonly AdminActionFieldError[];
    }>
  | Readonly<{
      status: "authorization";
      message: string;
    }>
  | Readonly<{
      status: "conflict";
      message: string;
      actualVersion?: number;
    }>
  | Readonly<{
      status: "error";
      message: string;
    }>
  | Readonly<{
      status: "success";
      message: string;
      postId: string;
      version: number;
      redirectTo?: string;
    }>;
