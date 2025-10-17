import { LanguageEntryPage } from "@/components/language-entry";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  return <LanguageEntryPage language="jp" languageLabel="日本語" slug={params.slug} />;
}
