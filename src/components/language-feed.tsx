import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listEntries, type LanguageCode } from "@/lib/content-store";

export interface LanguageFeedProps {
  language: LanguageCode;
  languageLabel: string;
  description?: string;
}

export async function LanguageFeed({ language, languageLabel, description }: LanguageFeedProps) {
  const entries = await listEntries(language);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{languageLabel}发布</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              还没有内容，前往编辑器发布第一篇吧。
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => {
            const formattedTime = formatTimestamp(entry.publishedAt, entry.timezone);
            return (
              <Link
                key={entry.id}
                href={`/${entry.language}/${entry.slug}`}
                className="group"
              >
                <Card className="transition-all hover:border-primary/60 hover:shadow-md">
                  <CardHeader className="gap-3">
                    <CardTitle className="text-base font-normal leading-relaxed">
                      {entry.text}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{formattedTime}</Badge>
                      <Badge variant="outline">{entry.city}</Badge>
                      <Badge variant="outline">{entry.weatherSummary}</Badge>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
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
