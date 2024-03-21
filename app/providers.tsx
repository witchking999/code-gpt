import React, { ReactNode } from "react";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ProvidersProps {
  children: ReactNode; // Specify that children should be a React node
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <NextThemesProvider>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </NextThemesProvider>
  );
};
