import { useState, useCallback } from "react";
import SplashIntro from "@/components/SplashIntro";
import BrowseHome from "@/components/BrowseHome";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("starlight-splash-seen")) return false;
    return true;
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("starlight-splash-seen", "1");
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashIntro onComplete={handleSplashComplete} />}
      <BrowseHome />
    </>
  );
};

export default Index;
