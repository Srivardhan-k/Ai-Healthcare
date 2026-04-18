import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { HomeDashboard } from "./pages/HomeDashboard";
import { MedicineInput } from "./pages/MedicineInput";
import { ResultScreen } from "./pages/ResultScreen";
import { FitnessInput } from "./pages/FitnessInput";
import { ProfileScreen } from "./pages/ProfileScreen";
import { NotFound } from "./pages/NotFound";
import { SchedulerScreen } from "./pages/SchedulerScreen";
import { RiskPredictionScreen } from "./pages/RiskPredictionScreen";
import { ChatBot } from "./pages/ChatBot";  // NEW: AI Chatbot

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomeDashboard },
      { path: "medicine-input", Component: MedicineInput },
      { path: "result", Component: ResultScreen },
      { path: "fitness", Component: FitnessInput },
      { path: "profile", Component: ProfileScreen },
      { path: "scheduler", Component: SchedulerScreen },
      { path: "risk-prediction", Component: RiskPredictionScreen },
      { path: "chat", Component: ChatBot },  // NEW: Chat route
      { path: "*", Component: NotFound },
    ],
  },
]);
