"use client";

import { useEffect, useState } from "react";

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
}

export const ClientOnlyWrapper = ({ children }: ClientOnlyWrapperProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading Sticker Generator...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
