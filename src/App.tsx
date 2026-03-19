import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResourceProvider } from "@/context/ResourceContext";
import DebugResourceState from "@/components/DebugResourceState";
import Index from "./pages/Index";
import ResourceDetail from "./pages/ResourceDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ResourceProvider>
        <BrowserRouter basename={routerBasename}>
          <div className="theme-navy">
            <DebugResourceState />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/resource/:id" element={<ResourceDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ResourceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
