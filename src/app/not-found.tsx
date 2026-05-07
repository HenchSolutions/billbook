"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.07),_transparent_55%)]"
      />
      <div className="relative animate-fade-in text-center">
        <div className="mb-8 flex justify-center">
          <Logo className="h-16 w-16" showText={false} />
        </div>

        <div className="mb-6">
          <h1 className="mb-2 text-8xl font-extrabold tracking-tight">
            <span className="text-primary">404</span>
          </h1>
          <div className="mx-auto h-1 w-24 rounded-full bg-primary/60"></div>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-foreground">Page not found</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 flex justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary/50"></div>
          <div className="animation-delay-200 h-2 w-2 animate-pulse rounded-full bg-chart-1/50"></div>
          <div className="animation-delay-400 h-2 w-2 animate-pulse rounded-full bg-chart-3/45"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
