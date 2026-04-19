import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";

export default function SharedShelfNotFound() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center text-center px-8">
      <Wordmark size={28} className="mb-10" />
      <Eyebrow className="mb-4">404</Eyebrow>
      <Display size="xl" className="mb-5">
        This shelf isn&apos;t here.
      </Display>
      <p className="font-serif italic text-[20px] text-ink-muted max-w-[520px] mb-10">
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
