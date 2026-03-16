import { useState, useCallback } from "react";
import { Category } from "@/types";
import SplashIntro from "@/components/SplashIntro";
import TriageScreen from "@/components/TriageScreen";
import TriageResults from "@/components/TriageResults";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("starlight-splash-seen")) return false;
    return true;
  });

  const [selectedNeeds, setSelectedNeeds] = useState<Category[] | null>(null);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("starlight-splash-seen", "1");
    setShowSplash(false);
  }, []);

  const handleTriageSubmit = useCallback((needs: Category[]) => {
    setSelectedNeeds(needs);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedNeeds(null);
  }, []);

  if (showSplash) {
    return <SplashIntro onComplete={handleSplashComplete} />;
  }

  if (selectedNeeds) {
    return <TriageResults needs={selectedNeeds} onBack={handleBack} />;
  }

  return <TriageScreen onSubmit={handleTriageSubmit} />;
};

export default Index;
