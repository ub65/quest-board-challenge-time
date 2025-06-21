
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocalizationProvider, useLocalization } from "@/contexts/LocalizationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

function DirectionWrapper({ children }: { children: React.ReactNode }) {
  const { language } = useLocalization();
  return (
    <div
      dir={language === "he" ? "rtl" : "ltr"}
      className={language === "he" ? "font-hebrew" : ""}
      style={{ width: "100vw", minHeight: "100vh" }}
    >
      {children}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocalizationProvider>
        <DirectionWrapper>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DirectionWrapper>
      </LocalizationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
