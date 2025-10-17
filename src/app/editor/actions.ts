"use server";

import { revalidatePath } from "next/cache";

import { appendEntry, type LanguageCode } from "@/lib/content-store";

export interface PublishPayload {
  language: LanguageCode;
  text: string;
  sourceText: string;
  timezone: string;
  city: string;
  weatherSummary: string;
}

export async function publishEntry(payload: PublishPayload) {
  if (!payload.text.trim()) {
    throw new Error("发布内容不能为空");
  }

  const entry = await appendEntry({
    language: payload.language,
    text: payload.text,
    sourceText: payload.sourceText,
    timezone: payload.timezone,
    city: payload.city,
    weatherSummary: payload.weatherSummary,
  });

  revalidatePath(`/${payload.language}`);
  revalidatePath(`/${payload.language}/${entry.slug}`);

  return entry;
}
