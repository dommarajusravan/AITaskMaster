import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { FeatureProvider } from "@/context/feature-context";
import { useState } from "react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import EmailSummary from "@/pages/email-summary";
import AgentDashboard from "@/pages/agents";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import Header from "@/components/layout/header";

function App() {
  const [location] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeatureProvider>
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <MobileSidebar 
                isOpen={isMobileSidebarOpen} 
                onClose={() => setIsMobileSidebarOpen(false)} 
              />
              
              <main className="flex-1 flex flex-col h-full overflow-hidden">
                <Header onToggleSidebar={toggleMobileSidebar} />
                
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/chat" component={Chat} />
                    <Route path="/email-summary" component={EmailSummary} />
                    <Route path="/agents" component={AgentDashboard} />
                    <Route component={NotFound} />
                  </Switch>
                </div>
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </FeatureProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
