import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResourceProvider } from "@/context/ResourceContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ResourceDetail from "./pages/ResourceDetail";
import Search from "./pages/Search";
import SubmitResource from "./pages/SubmitResource";
import ReviewQueue from "./pages/ReviewQueue";
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/resource/:id" element={<ResourceDetail />} />
              {/* HIDDEN: revisit later
              <Route path="/browse" element={<Browse />} />
              <Route path="/search" element={<Search />} />
              <Route path="/submit" element={<SubmitResource />} />
              <Route path="/review" element={<ReviewQueue />} />
              */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </ResourceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
