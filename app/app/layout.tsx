import { CreditsProvider } from "@/lib/contexts/credits-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <CreditsProvider>{children}</CreditsProvider>;
}
