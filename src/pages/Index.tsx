import { useState, useCallback } from "react";
import { Category } from "@/types";
import SplashIntro from "@/components/SplashIntro";
import TriageScreen from "@/components/TriageScreen";
import FollowUpFlow from "@/components/FollowUpFlow";
import TriageResults from "@/components/TriageResults";
import { getQuestionsForCategories } from "@/data/followUpQuestions";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("starlight-splash-seen")) return false;
    return true;
  });

  const [selectedNeeds, setSelectedNeeds] = useState<Category[] | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string> | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("starlight-splash-seen", "1");
    setShowSplash(false);
  }, []);

  const handleTriageSubmit = useCallback((needs: Category[]) => {
    setSelectedNeeds(needs);
    const questions = getQuestionsForCategories(needs);
    if (questions.length > 0) {
      setShowFollowUp(true);
    } else {
      setFollowUpAnswers({});
    }
  }, []);

  const handleFollowUpComplete = useCallback((answers: Record<string, string>) => {
    setFollowUpAnswers(answers);
    setShowFollowUp(false);
  }, []);

  const handleFollowUpBack = useCallback(() => {
    setShowFollowUp(false);
    setSelectedNeeds(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedNeeds(null);
    setFollowUpAnswers(null);
    setShowFollowUp(false);
  }, []);

  if (showSplash) {
    return <SplashIntro onComplete={handleSplashComplete} />;
  }

  if (selectedNeeds && showFollowUp) {
    return (
      <FollowUpFlow
        needs={selectedNeeds}
        onComplete={handleFollowUpComplete}
        onBack={handleFollowUpBack}
      />
    );
  }

  if (selectedNeeds && followUpAnswers !== null) {
    return (
      <TriageResults
        needs={selectedNeeds}
        followUpAnswers={followUpAnswers}
        onBack={handleBack}
      />
    );
  }

  return <TriageScreen onSubmit={handleTriageSubmit} />;
};

export default Index;
