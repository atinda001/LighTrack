import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Tabs from "./components/layout/Tabs";

import Dashboard from "./pages/Dashboard";
import RegisterTower from "./pages/RegisterTower";
import ScanQR from "./pages/ScanQR";
import GenerateQR from "./pages/GenerateQR";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Tabs />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/register" component={RegisterTower} />
          <Route path="/scan" component={ScanQR} />
          <Route path="/generate/:id" component={GenerateQR} />
          <Route path="/reports" component={Reports} />
          <Route path="/admin" component={AdminPanel} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
