import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth-environment";

export type OwnerIdentity = {
  userId: string;
  email: string;
  name: string;
};

async function requireOwnerSession(allowTwoFactorSetup: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !isAdminEmail(session.user.email)) redirect("/admin/login");

  if (!allowTwoFactorSetup && session.user.twoFactorEnabled !== true) {
    redirect("/admin/settings/security");
  }

  return session;
}

function ownerIdentity(session: Awaited<ReturnType<typeof requireOwnerSession>>): OwnerIdentity {
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function requireOwner(): Promise<OwnerIdentity> {
  return ownerIdentity(await requireOwnerSession(false));
}

export async function requireOwnerForSetup(): Promise<OwnerIdentity> {
  return ownerIdentity(await requireOwnerSession(true));
}
