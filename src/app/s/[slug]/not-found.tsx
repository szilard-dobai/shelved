import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";

export default function SharedShelfNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-8 text-center text-ink">
      <Wordmark size={28} className="mb-10" />
      <Eyebrow className="mb-4">404</Eyebrow>
      <Display size="xl" className="mb-5">
        This shelf isn&apos;t here.
      </Display>
      <p className="mb-10 max-w-lg font-serif text-xl italic text-ink-muted">
        The link might be mistyped, or the shelf may have been removed.
      </p>
      <Link href="/">
        <Button variant="gold" size="lg">
          Make your own
        </Button>
      </Link>
    </div>
  );
}
