"use client";

import * as React from "react";
import Link from "next/link";

import { publishEntry } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { LanguageCode } from "@/lib/content-store";

const languageOptions: Array<{ code: LanguageCode; label: string }> = [
  { code: "zh", label: "中文" },
  { code: "jp", label: "日本語" },
  { code: "en", label: "English" },
];

const DEFAULT_CITY = "东京";
const DEFAULT_WEATHER = "大约是晴天";

type WeatherResponse = {
  current?: {
    temperature_2m?: number | null;
  } | null;
};

type ReverseGeocodeResponse = {
  results?: Array<{
    name?: string | null;
    city?: string | null;
    country?: string | null;
  }> | null;
};

interface PublishState {
  success: boolean;
  message: string;
  slug?: string;
  language?: LanguageCode;
}

export default function EditorPage() {
  const [sourceText, setSourceText] = React.useState("");
  const [drafts, setDrafts] = React.useState<Record<LanguageCode, string>>({
    zh: "",
    jp: "",
    en: "",
  });
  const [targetLanguage, setTargetLanguage] = React.useState<LanguageCode>("zh");
  const [targetText, setTargetText] = React.useState("");
  const [timezone, setTimezone] = React.useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
  );
  const [city, setCity] = React.useState(DEFAULT_CITY);
  const [weatherSummary, setWeatherSummary] = React.useState(DEFAULT_WEATHER);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const [publishState, setPublishState] = React.useState<PublishState | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPublishing, startPublish] = React.useTransition();

  React.useEffect(() => {
     setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC");
  }, []);

  const refreshWeather = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setCity(DEFAULT_CITY);
      setWeatherSummary(DEFAULT_WEATHER);
      return;
    }

    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
            { cache: "no-store" },
          );
          if (!weatherResponse.ok) {
            throw new Error("weather request failed");
          }

          const weatherJson = (await weatherResponse.json()) as WeatherResponse;
          const temperature =
            typeof weatherJson?.current?.temperature_2m === "number"
              ? Math.round(weatherJson.current.temperature_2m)
              : null;
          const summary =
            temperature !== null ? `当前气温 ${temperature}°C` : DEFAULT_WEATHER;
          setWeatherSummary(summary);

          let resolvedCity = DEFAULT_CITY;
          try {
            const placeResponse = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=zh`,
              { cache: "no-store" },
            );
            if (placeResponse.ok) {
              const placeJson = (await placeResponse.json()) as ReverseGeocodeResponse;
              const result = placeJson?.results?.[0];
              const cityName =
                (typeof result?.name === "string" && result.name) ||
                (typeof result?.city === "string" && result.city) ||
                (typeof result?.country === "string" && result.country) ||
                "";
              if (cityName) {
                resolvedCity = cityName;
              }
            }
          } catch {
            resolvedCity = DEFAULT_CITY;
          }

          setCity(resolvedCity);
        } catch {
          setCity(DEFAULT_CITY);
          setWeatherSummary(DEFAULT_WEATHER);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setCity(DEFAULT_CITY);
        setWeatherSummary(DEFAULT_WEATHER);
        setWeatherLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  }, []);

  React.useEffect(() => {
     refreshWeather();
  }, [refreshWeather]);

  React.useEffect(() => {
     setDrafts((prev) => {
       if (prev.zh === sourceText) {
         return prev;
       }
       return { ...prev, zh: sourceText };
     });
     if (targetLanguage === "zh") {
       setTargetText(sourceText);
     }
  }, [sourceText, targetLanguage]);

  React.useEffect(() => {
     setDrafts((prev) => {
       if (prev[targetLanguage] === targetText) {
         return prev;
       }
       return { ...prev, [targetLanguage]: targetText };
     });
  }, [targetLanguage, targetText]);

  const handleSelectLanguage = (language: LanguageCode) => {
     setTargetLanguage(language);
     if (language === "zh") {
       setTargetText(sourceText);
       return;
     }
     const nextText = drafts[language] || sourceText;
     setTargetText(nextText);
  };

  const handlePublish = () => {
     setError(null);
     setPublishState(null);
     startPublish(async () => {
       try {
         const entry = await publishEntry({
           language: targetLanguage,
           text: targetText.trim(),
           sourceText: sourceText.trim(),
           timezone,
           city: city || "未知城市",
           weatherSummary: weatherSummary || "天气信息不可用",
         });
         setPublishState({
           success: true,
           message: "发布成功",
           slug: entry.slug,
           language: entry.language,
         });
         setSourceText("");
         setTargetText("");
         setDrafts({ zh: "", jp: "", en: "" });
       } catch (err) {
         const message =
           err instanceof Error ? err.message : "发布失败，请稍后再试";
         setError(message);
         setPublishState({
           success: false,
           message,
         });
       }
     });
  };

  const disabled =
     isPublishing ||
     !sourceText.trim() ||
     !targetText.trim() ||
     !timezone ||
     !city ||
     !weatherSummary;

  return (
     <div className="flex h-screen flex-col gap-4 p-6">
       <header className="rounded-lg border bg-card/50 p-4 shadow-sm backdrop-blur">
         <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
           <div>
             <h1 className="text-xl font-semibold">多语言写作编辑器</h1>
             <p className="text-sm text-muted-foreground">
               左侧输入中文，选择目标语言后可在右侧调整最终内容。
             </p>
           </div>
           <div className="flex flex-wrap items-center gap-2">
             <Badge variant="outline">{timezone}</Badge>
             <Badge variant="outline">{city}</Badge>
             <Badge variant="outline">{weatherSummary}</Badge>
             <Button variant="ghost" size="sm" onClick={refreshWeather} disabled={weatherLoading}>
               {weatherLoading ? "更新中…" : "更新天气"}
             </Button>
             <Button
               onClick={handlePublish}
               disabled={disabled}
               className="min-w-24"
             >
               {isPublishing ? "发布中…" : "发布"}
             </Button>
           </div>
         </div>
         <div className="mt-4 flex flex-wrap items-center gap-2">
           {languageOptions.map((option) => (
             <Button
               key={option.code}
               variant={option.code === targetLanguage ? "default" : "outline"}
               size="sm"
               onClick={() => handleSelectLanguage(option.code)}
             >
               {option.label}
             </Button>
           ))}
         </div>
       </header>

       <ResizablePanelGroup
         direction="horizontal"
         className="flex-1 overflow-hidden rounded-lg border shadow-sm"
       >
         <ResizablePanel defaultSize={50} minSize={25}>
           <div className="flex h-full flex-col">
             <div className="flex items-center justify-between border-b px-4 py-3">
               <div className="text-sm font-medium text-muted-foreground">
                 中文原稿
               </div>
               <span className="text-xs text-muted-foreground">
                 {sourceText.length} 字符
               </span>
             </div>
             <ScrollArea className="flex-1">
               <Textarea
                 placeholder="在此输入中文内容…"
                 className="h-full min-h-[40vh] rounded-none border-0 focus-visible:ring-0"
                 value={sourceText}
                 onChange={(event) => setSourceText(event.target.value)}
               />
             </ScrollArea>
           </div>
         </ResizablePanel>

         <ResizableHandle withHandle />

         <ResizablePanel defaultSize={50} minSize={25}>
           <div className="flex h-full flex-col">
             <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-sm font-medium text-muted-foreground">
                {`${languageOptions.find((item) => item.code === targetLanguage)?.label ?? ""}最终稿`}
              </div>
               <span className="text-xs text-muted-foreground">
                 {targetText.length} 字符
               </span>
             </div>
             <ScrollArea className="flex-1">
               <Textarea
                 placeholder="目标语言内容…"
                 className="h-full min-h-[40vh] rounded-none border-0 focus-visible:ring-0"
                 value={targetText}
                 onChange={(event) => setTargetText(event.target.value)}
               />
             </ScrollArea>
           </div>
         </ResizablePanel>
       </ResizablePanelGroup>

       <section className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>发布信息</CardTitle>
             <CardDescription>
               如遇定位失败，可以在下方手动调整城市与天气描述。
             </CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col gap-4">
             <div className="space-y-2">
               <Label className="text-sm font-medium text-muted-foreground">城市</Label>
               <Input value={city} onChange={(event) => setCity(event.target.value)} />
             </div>
             <div className="space-y-2">
               <Label className="text-sm font-medium text-muted-foreground">天气</Label>
               <Input
                 value={weatherSummary}
                 onChange={(event) => setWeatherSummary(event.target.value)}
               />
             </div>
             <div className="space-y-2">
               <Label className="text-sm font-medium text-muted-foreground">时区</Label>
               <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle>发布状态</CardTitle>
             <CardDescription>查看发布结果和最近一次的链接。</CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col gap-3">
             {publishState ? (
               publishState.success && publishState.slug && publishState.language ? (
                 <div className="text-sm text-foreground">
                   发布成功，访问{" "}
                   <Link
                     href={`/${publishState.language}/${publishState.slug}`}
                     className="underline"
                   >
                     {`/${publishState.language}/${publishState.slug}`}
                   </Link>
                 </div>
               ) : (
                 <div className="text-sm text-destructive">{publishState.message}</div>
               )
             ) : (
               <div className="text-sm text-muted-foreground">尚未发布内容。</div>
             )}
             {error && <div className="text-sm text-destructive">{error}</div>}
           </CardContent>
         </Card>
       </section>
     </div>
  );
}
