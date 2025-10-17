import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <nav className="grid grid-cols-2 gap-6">
        <Link
          href="/zh"
          aria-label="中文"
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-black/10 dark:border-white/15 shadow-sm bg-white dark:bg-black/20 flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <span role="img" aria-hidden className="text-2xl sm:text-3xl">🇨🇳</span>
        </Link>
        <Link
          href="/jp"
          aria-label="日本語"
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-black/10 dark:border-white/15 shadow-sm bg-white dark:bg-black/20 flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <span role="img" aria-hidden className="text-2xl sm:text-3xl">🇯🇵</span>
        </Link>
        <Link
          href="/en"
          aria-label="English"
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-black/10 dark:border-white/15 shadow-sm bg-white dark:bg-black/20 flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <span role="img" aria-hidden className="text-2xl sm:text-3xl">🇬🇧</span>
        </Link>
        <Link
          href="/editor"
          aria-label="Editor"
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-black/10 dark:border-white/15 shadow-sm bg-white dark:bg-black/20 flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <span role="img" aria-hidden className="text-2xl sm:text-3xl">✍️</span>
        </Link>
      </nav>
    </div>
  );
}
