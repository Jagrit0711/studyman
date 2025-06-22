import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import GlobalMomMode from "@/components/GlobalMomMode";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Focus from "./pages/Focus";
import StudyRooms from "./pages/StudyRooms";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import CreateRoom from "./pages/CreateRoom";
import NotFound from "./pages/NotFound";
import OnboardingFlow from "./pages/OnboardingFlow";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import SessionReady from './pages/SessionReady';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/study-rooms" element={<StudyRooms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/create-room" element={<CreateRoom />} />
              <Route path="/session/:eventId" element={<SessionReady />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global Mom Mode - appears on all pages when enabled */}
            <GlobalMomMode />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
