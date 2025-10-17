import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
const EMPTY_CONTENT: ContentFileShape = { zh: [], jp: [], en: [] };

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_BASE_URL = (process.env.BLOB_STORE_URL ?? "https://blob.vercel-storage.com").replace(/\/+$/, "");
const BLOB_KEY = process.env.CONTENT_BLOB_KEY ?? "content/content.json";
const BLOB_PATH = BLOB_KEY.split("/").map((segment) => encodeURIComponent(segment)).join("/");
const BLOB_URL = `${BLOB_BASE_URL}/${BLOB_PATH}`;
const USING_BLOB_STORE = Boolean(BLOB_TOKEN);

async function readContent(): Promise<ContentFileShape> {
  if (USING_BLOB_STORE) {
    const existing = await readContentFromBlob();
    if (existing) {
      return existing;
    }
    await writeContentToBlob(EMPTY_CONTENT);
    return EMPTY_CONTENT;
  }

  return readContentFromFilesystem();
}

async function writeContent(data: ContentFileShape) {
  if (USING_BLOB_STORE) {
    await writeContentToBlob(data);
    return;
  }

  await writeContentToFilesystem(data);
}

async function readContentFromFilesystem(): Promise<ContentFileShape> {
  try {
    const raw = await readFile(CONTENT_FILE, "utf8");
    return JSON.parse(raw) as ContentFileShape;
  } catch {
    await writeFile(CONTENT_FILE, JSON.stringify(EMPTY_CONTENT, null, 2), "utf8");
    return EMPTY_CONTENT;
  }
}

async function writeContentToFilesystem(data: ContentFileShape) {
  await writeFile(CONTENT_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function readContentFromBlob(): Promise<ContentFileShape | null> {
  if (!BLOB_TOKEN) {
    return null;
  }

  const response = await fetch(BLOB_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BLOB_TOKEN}`,
      "x-vercel-blob-version": "1",
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to read content data (status ${response.status})`);
  }

  const text = await response.text();
  if (!text) {
    return EMPTY_CONTENT;
  }

  return JSON.parse(text) as ContentFileShape;
}

async function writeContentToBlob(data: ContentFileShape) {
  if (!BLOB_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN for blob storage");
  }

  const response = await fetch(BLOB_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${BLOB_TOKEN}`,
      "Content-Type": "application/json",
      "x-vercel-blob-version": "1",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist content data (status ${response.status})`);
  }
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
