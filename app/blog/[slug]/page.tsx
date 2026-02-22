import { notFound } from "next/navigation";
import { getPostSlugs, getPostWithHtml } from "@/lib/blog";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ""),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostWithHtml(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Spotonaut Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage?.url || post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostWithHtml(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="py-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zpět na blog
            </Link>
          </Button>
        </div>

        {/* Article */}
        <article>
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl font-semibold md:text-5xl lg:text-5xl mb-6">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="outline">
                <Calendar className="w-3 h-3" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("cs-CZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </Badge>
              {post.author && (
                <Badge variant="outline">
                  <User className="w-3 h-3" />
                  <span>{post.author.name}</span>
                </Badge>
              )}
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-12 rounded-xl overflow-hidden bg-muted/50 border">
              <div className="aspect-video w-full flex items-center justify-center text-muted-foreground/30">
                {/* Placeholder for image */}
                <span className="text-sm">Cover Image: {post.coverImage}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-neutral dark:prose-invert prose-lg max-w-none
                prose-headings:font-bold prose-headings:font-inter
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8
                prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold
                prose-ul:my-6
                prose-ol:my-6
                prose-li:my-2
                prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Back to Blog Footer */}
        <div className="mt-16 pt-8 border-t">
          <Button asChild variant="outline">
            <Link href="/blog" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Zpět na všechny články
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
