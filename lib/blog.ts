import fs from "fs";
import { basename, extname, join, relative } from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import { DEFAULT_LOCALE, isSupportedLocale, Locale } from "@/lib/i18n/config";

const postsDirectory = join(process.cwd(), "_posts");

export interface PostFrontMatter {
  postId?: string;
  locale?: Locale;
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
  slug: string;
  content: string;
}

interface PostRecord extends Post {
  sourcePath: string;
}

function getMarkdownFiles(directory: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(directory)) {
    return results;
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...getMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && extname(entry.name) === ".md") {
      results.push(fullPath);
    }
  }

  return results;
}

function detectLocaleFromPath(absolutePath: string): Locale {
  const relativePath = relative(postsDirectory, absolutePath);
  const firstSegment = relativePath.split(/[/\\]/)[0];

  if (isSupportedLocale(firstSegment)) {
    return firstSegment;
  }

  return DEFAULT_LOCALE;
}

function readPostRecord(filePath: string): PostRecord | null {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const fileSlug = basename(filePath, ".md");
    const localeFromData = data.locale;
    const locale = isSupportedLocale(localeFromData)
      ? localeFromData
      : detectLocaleFromPath(filePath);

    const slug =
      typeof data.slug === "string" && data.slug.trim().length > 0
        ? data.slug.trim()
        : fileSlug;

    const postId =
      typeof data.postId === "string" && data.postId.trim().length > 0
        ? data.postId.trim()
        : fileSlug;

    return {
      postId,
      locale,
      title: data.title ?? slug,
      excerpt: data.excerpt ?? "",
      coverImage: data.coverImage ?? "",
      date: data.date ?? "",
      author: data.author,
      ogImage: data.ogImage,
      slug,
      content,
      sourcePath: filePath,
    };
  } catch (error) {
    console.error(`Error reading post file ${filePath}:`, error);
    return null;
  }
}

function getAllPostRecords(): PostRecord[] {
  const markdownFiles = getMarkdownFiles(postsDirectory);
  const records = markdownFiles
    .map((filePath) => readPostRecord(filePath))
    .filter((record): record is PostRecord => Boolean(record));

  return records;
}

function pickLocalizedRecord(
  records: PostRecord[],
  locale: Locale,
): PostRecord | null {
  if (records.length === 0) {
    return null;
  }

  return (
    records.find((record) => record.locale === locale) ||
    records.find((record) => record.locale === DEFAULT_LOCALE) ||
    records[0]
  );
}

function mapRecordToFields(
  record: PostRecord,
  fields: string[] = [],
): Partial<Post> {
  if (!fields.length) {
    return {
      postId: record.postId,
      locale: record.locale,
      title: record.title,
      excerpt: record.excerpt,
      coverImage: record.coverImage,
      date: record.date,
      author: record.author,
      ogImage: record.ogImage,
      slug: record.slug,
      content: record.content,
    };
  }

  const items: Partial<Post> = {};
  const recordData = record as unknown as Record<string, unknown>;

  fields.forEach((field) => {
    if (field in recordData) {
      (items as Record<string, unknown>)[field] = recordData[field];
    }
  });

  return items;
}

/**
 * Get all post slugs from the _posts directory
 */
export function getPostSlugs(locale: Locale = DEFAULT_LOCALE): string[] {
  try {
    const groupedByPostId = getAllPostRecords().reduce<
      Map<string, PostRecord[]>
    >((acc, record) => {
      const key = record.postId || record.slug;
      const current = acc.get(key) ?? [];
      current.push(record);
      acc.set(key, current);
      return acc;
    }, new Map());

    const localizedSlugs = Array.from(groupedByPostId.values())
      .map((records) => pickLocalizedRecord(records, locale))
      .filter((record): record is PostRecord => Boolean(record))
      .map((record) => record.slug);

    return Array.from(new Set(localizedSlugs));
  } catch (error) {
    console.error("Error reading posts directory:", error);
    return [];
  }
}

export function getPostRouteSlugs(): string[] {
  const slugs = getAllPostRecords().map((record) => record.slug);
  return Array.from(new Set(slugs));
}

/**
 * Get a single post by slug with optional fields
 */
export function getPostBySlug(
  slug: string,
  fields: string[] = [],
  locale: Locale = DEFAULT_LOCALE,
): Partial<Post> {
  const realSlug = slug.replace(/\.md$/, "");

  const candidates = getAllPostRecords().filter(
    (record) => record.slug === realSlug,
  );

  const selected = pickLocalizedRecord(candidates, locale);

  if (!selected) {
    return { slug: realSlug };
  }

  return mapRecordToFields(selected, fields);
}

/**
 * Get all posts sorted by date (newest first)
 */
export function getAllPosts(
  fields: string[] = [],
  locale: Locale = DEFAULT_LOCALE,
): Partial<Post>[] {
  const groupedByPostId = getAllPostRecords().reduce<Map<string, PostRecord[]>>(
    (acc, record) => {
      const key = record.postId || record.slug;
      const current = acc.get(key) ?? [];
      current.push(record);
      acc.set(key, current);
      return acc;
    },
    new Map(),
  );

  const posts = Array.from(groupedByPostId.values())
    .map((records) => pickLocalizedRecord(records, locale))
    .filter((record): record is PostRecord => Boolean(record))
    .map((record) => mapRecordToFields(record, fields))
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
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

/**
 * Get a post with its content converted to HTML
 */
export async function getPostWithHtml(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Post | null> {
  try {
    const post = getPostBySlug(
      slug,
      [
        "postId",
        "locale",
        "title",
        "excerpt",
        "date",
        "slug",
        "author",
        "content",
        "coverImage",
        "ogImage",
      ],
      locale,
    );

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
