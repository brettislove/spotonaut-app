import type { PrismaClient } from "@prisma/client";
import {
  anonymizeIP,
  extractIPFromHeaders,
} from "@/lib/security/ip-anonymization";

type AdminAuditPayload = {
  action: string;
  resource: string;
  result: "success" | "denied" | "error";
  actorEmail?: string | null;
  details?: Record<string, unknown>;
};

export async function writeAdminAuditEvent(
  prisma: PrismaClient,
  headers: Headers,
  payload: AdminAuditPayload,
): Promise<void> {
  try {
    const ip = extractIPFromHeaders(headers);
    const anonymousId = anonymizeIP(ip);

    await prisma.userEvent.create({
      data: {
        userId: null,
        anonymousId,
        sessionId: null,
        eventType: "admin_action",
        page: "/admin",
        eventData: {
          actorEmail: payload.actorEmail || null,
          action: payload.action,
          resource: payload.resource,
          result: payload.result,
          details: payload.details || null,
          auditedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Failed to write admin audit event", error);
  }
}
