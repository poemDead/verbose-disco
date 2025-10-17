import { LanguageFeed } from "@/components/language-feed";

export default function Page() {
  return (
    <LanguageFeed
      language="zh"
      languageLabel="中文"
      description="这里展示已经发布的中文成稿。"
    />
  );
}
