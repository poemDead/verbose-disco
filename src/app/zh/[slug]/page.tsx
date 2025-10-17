import { LanguageEntryPage } from "@/components/language-entry";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  return <LanguageEntryPage language="zh" languageLabel="中文" slug={params.slug} />;
}
