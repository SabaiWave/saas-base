"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function UpgradeProcessingBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsProcessing(true);

      let remainingTime = 10;
      const interval = setInterval(() => {
        remainingTime -= 1;
        setCountdown(remainingTime);

        if (remainingTime <= 0) {
          clearInterval(interval);
          router.refresh();
          setIsProcessing(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [searchParams, router]);

  if (!isProcessing) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing Your Upgrade
        </CardTitle>
        <CardDescription className="text-blue-700">
          We&apos;re activating your Plus subscription. This usually takes a few seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-600">
          Refreshing in {countdown} seconds... If you don&apos;t see Plus, refresh the page manually.
        </p>
      </CardContent>
    </Card>
  );
}
