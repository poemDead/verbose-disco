import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

export const LANGUAGES = ["zh", "jp", "en"] as const;
export type LanguageCode = (typeof LANGUAGES)[number];

export interface ContentEntry {
  id: string;
  slug: string;
  language: LanguageCode;
  text: string;
  sourceText: string;
  publishedAt: string;
  timezone: string;
  city: string;
  weatherSummary: string;
}

interface ContentFileShape {
  zh: ContentEntry[];
  jp: ContentEntry[];
  en: ContentEntry[];
}

const CONTENT_FILE = path.join(process.cwd(), "content", "content.json");

const ensureContentFile = cache(async () => {
  try {
    await readFile(CONTENT_FILE, "utf8");
  } catch {
    const empty: ContentFileShape = { zh: [], jp: [], en: [] };
    await writeFile(CONTENT_FILE, JSON.stringify(empty, null, 2), "utf8");
  }
});

async function readContent(): Promise<ContentFileShape> {
  await ensureContentFile();
  const raw = await readFile(CONTENT_FILE, "utf8");
  return JSON.parse(raw) as ContentFileShape;
}

async function writeContent(data: ContentFileShape) {
  await writeFile(CONTENT_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function listEntries(language: LanguageCode): Promise<ContentEntry[]> {
  const data = await readContent();
  return [...data[language]].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getEntry(language: LanguageCode, slug: string) {
  const entries = await listEntries(language);
  return entries.find((entry) => entry.slug === slug) ?? null;
}

export interface NewEntryInput {
  language: LanguageCode;
  text: string;
  sourceText: string;
  timezone: string;
  city: string;
  weatherSummary: string;
}

export async function appendEntry(input: NewEntryInput): Promise<ContentEntry> {
  const data = await readContent();
  const now = new Date();
  const id = randomUUID();
  const slug = createSlug(now, input.language);
  const entry: ContentEntry = {
    id,
    slug,
    language: input.language,
    text: input.text,
    sourceText: input.sourceText,
    publishedAt: now.toISOString(),
    timezone: input.timezone,
    city: input.city,
    weatherSummary: input.weatherSummary,
  };

  data[input.language] = [...data[input.language], entry];
  await writeContent(data);
  return entry;
}

function createSlug(date: Date, language: LanguageCode) {
  const timestamp =
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .slice(0, 15) + date.getMilliseconds().toString().padStart(3, "0");
  return `${language}-${timestamp}`;
}
