import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid mask-fade-b" />
      <LogoMark className="relative mb-8 size-10" />
      <p className="relative font-mono text-sm text-muted-foreground">404</p>
      <h1 className="relative mt-2 text-2xl font-semibold tracking-tight">Bu sayfa müfredatta yok</h1>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Button asChild className="relative mt-8">
        <Link href="/panel">Özete dön</Link>
      </Button>
    </div>
  );
}
