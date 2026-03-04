import { getAllPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { detectLocaleFromServerContext } from "@/lib/i18n/detect-locale";
import { createTranslator } from "@/lib/i18n/translator";

export const metadata: Metadata = {
  title: "Blog | SpotOnaut",
  description:
    "Články, tipy a případové studie o výběru ideální lokality pro vaše podnikání",
};

export default async function BlogPage() {
  const locale = await detectLocaleFromServerContext();
  const t = createTranslator(locale);

  const posts = getAllPosts(
    ["title", "date", "slug", "excerpt", "coverImage", "ogImage", "author"],
    locale,
  );

  return (
    <section className={cn("py-32")}>
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            {t("blog.title")}
          </h2>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {t("blog.description")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <Card
              key={post.slug}
              className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0"
            >
              <div className="aspect-16/9 w-full">
                <Link
                  href={post.slug ? `/blog/${post.slug}` : "/blog"}
                  className="transition-opacity duration-200 fade-in hover:opacity-70"
                >
                  <Image
                    src={
                      post.ogImage?.url || post.coverImage || "/placeholder.png"
                    }
                    alt={post.title ?? ""}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover object-center"
                  />
                </Link>
              </div>
              <CardHeader>
                <h3 className="text-lg font-semibold hover:underline md:text-xl">
                  <Link href={post.slug ? `/blog/${post.slug}` : "/blog"}>
                    {post.title}
                  </Link>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Link
                  href={post.slug ? `/blog/${post.slug}` : "/blog"}
                  className="flex items-center text-foreground hover:underline"
                >
                  {t("blog.readMore")}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
