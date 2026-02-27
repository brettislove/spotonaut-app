import { getAllPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog | SpotOnaut",
  description:
    "Články, tipy a případové studie o výběru ideální lokality pro vaše podnikání",
};

export default function BlogPage() {
  const posts = getAllPosts([
    "title",
    "date",
    "slug",
    "excerpt",
    "coverImage",
    "author",
  ]);

  return (
    <section className={cn("py-32")}>
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            {"Blog"}
          </h2>
          <p className="mb-8 text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {
              "Praktické tipy, návody a případové studie k výběru lokality a podnikatelskému rozhodování na základě dat."
            }
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <Card
              key={post.slug}
              className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden pt-0"
            >
              <div className="aspect-16/9 w-full">
                <a
                  href={post.slug ? `/blog/${post.slug}` : "#"}
                  target="_blank"
                  className="transition-opacity duration-200 fade-in hover:opacity-70"
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-full w-full object-cover object-center"
                  />
                </a>
              </div>
              <CardHeader>
                <h3 className="text-lg font-semibold hover:underline md:text-xl">
                  <a
                    href={post.slug ? `/blog/${post.slug}` : "#"}
                    target="_blank"
                  >
                    {post.title}
                  </a>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <a
                  href={post.slug ? `/blog/${post.slug}` : "#"}
                  target="_blank"
                  className="flex items-center text-foreground hover:underline"
                >
                  Číst dál
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
