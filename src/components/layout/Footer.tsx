import { ThemeToggle } from "@/components/ThemeToggle";

export function Footer() {
  return (
    <footer className="border-t border-rule bg-bg-raised/40">
      <div className="mx-auto max-w-[1320px] px-5 py-4 md:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-ink-muted font-mono">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/szilard-dobai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity underline"
            >
              Szilard Dobai
            </a>
          </p>

          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
