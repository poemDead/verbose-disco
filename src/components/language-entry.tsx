import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEntry, type LanguageCode } from "@/lib/content-store";

export interface LanguageEntryPageProps {
  language: LanguageCode;
  languageLabel: string;
  slug: string;
}

export async function LanguageEntryPage({
  language,
  languageLabel,
  slug,
}: LanguageEntryPageProps) {
  const entry = await getEntry(language, slug);

  if (!entry) {
    notFound();
  }

  const formattedTime = formatTimestamp(entry.publishedAt, entry.timezone);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <Link href={`/${language}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← 返回{languageLabel}列表
        </Link>
        <h1 className="text-2xl font-semibold">{languageLabel}成稿</h1>
      </header>
      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base font-normal leading-relaxed">{entry.text}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{formattedTime}</Badge>
            <Badge variant="outline">{entry.city}</Badge>
            <Badge variant="outline">{entry.weatherSummary}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}

function formatTimestamp(dateIso: string, timezone: string) {
  const date = new Date(dateIso);
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone || "UTC",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }
}
