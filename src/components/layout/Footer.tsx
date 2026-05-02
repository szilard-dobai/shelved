import { ThemeToggle } from "@/components/ThemeToggle";

export function Footer() {
  return (
    <footer className="border-t border-rule bg-bg-raised/40">
      <div className="mx-auto flex max-w-page flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row md:px-12">
        <p className="font-mono text-sm text-ink-muted">
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/szilard-dobai/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-opacity hover:opacity-80"
          >
            Szilard Dobai
          </a>
        </p>

        <ThemeToggle />
      </div>
    </footer>
  );
}
