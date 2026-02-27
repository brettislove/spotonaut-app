import Link from "next/link";
import ContactSection from "@/components/contact";

export default function KontaktPage() {
  return (
    <div>
      <section className="pt-24 md:pt-28">
        <div className="container mx-auto px-4 lg:px-16">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zpět do aplikace
          </Link>
        </div>
      </section>
      <ContactSection />
    </div>
  );
}
