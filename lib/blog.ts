import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = join(process.cwd(), "_posts");

export interface PostFrontMatter {
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    picture: string;
  };
  ogImage: {
    url: string;
  };
  slug?: string;
}

export interface Post extends PostFrontMatter {
  content: string;
}

/**
 * Get all post slugs from the _posts directory
 */
export function getPostSlugs(): string[] {
  try {
    const files = fs.readdirSync(postsDirectory);
    return files.filter((file) => file.endsWith(".md"));
  } catch (error) {
    console.error("Error reading posts directory:", error);
    return [];
  }
}

/**
 * Get a single post by slug with optional fields
 */
export function getPostBySlug(
  slug: string,
  fields: string[] = [],
): Partial<Post> {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const items: Partial<Post> = {};

    // Ensure only the minimal needed data is exposed
    fields.forEach((field) => {
      if (field === "slug") {
        items[field] = realSlug;
      }
      if (field === "content") {
        items[field] = content;
      }

      if (typeof data[field] !== "undefined") {
        items[field as keyof Post] = data[field];
      }
    });

    return items;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return { slug: realSlug };
  }
}

/**
 * Get all posts sorted by date (newest first)
 */
export function getAllPosts(fields: string[] = []): Partial<Post>[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => {
      const date1 = post1.date || "";
      const date2 = post2.date || "";
      return date1 > date2 ? -1 : 1;
    });
  return posts;
}

/**
 * Convert markdown string to HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

/**
 * Get a post with its content converted to HTML
 */
export async function getPostWithHtml(slug: string): Promise<Post | null> {
  try {
    const post = getPostBySlug(slug, [
      "title",
      "excerpt",
      "date",
      "slug",
      "author",
      "content",
      "coverImage",
      "ogImage",
    ]);

    if (!post.content) {
      return null;
    }

    const content = await markdownToHtml(post.content);

    return {
      ...post,
      slug: post.slug || slug,
      content,
    } as Post;
  } catch (error) {
    console.error(`Error processing post ${slug}:`, error);
    return null;
  }
}
