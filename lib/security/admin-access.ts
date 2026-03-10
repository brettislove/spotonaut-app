export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    return false;
  }

  try {
    const parsed = JSON.parse(adminEmailsEnv);
    if (!Array.isArray(parsed)) {
      return false;
    }

    const normalizedEmail = email.toLowerCase();
    return parsed
      .map((value) => String(value).toLowerCase())
      .includes(normalizedEmail);
  } catch (error) {
    console.error("Failed to parse ADMIN_EMAILS", error);
    return false;
  }
}
