import { LanguageEntryPage } from "@/components/language-entry";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  return <LanguageEntryPage language="en" languageLabel="English" slug={params.slug} />;
}
