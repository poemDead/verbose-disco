import { LanguageEntryPage } from "@/components/language-entry";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <LanguageEntryPage language="jp" languageLabel="日本語" slug={slug} />;
}
