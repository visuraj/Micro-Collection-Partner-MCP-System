import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { SidebarProvider } from "@/context/SidebarContext";

createRoot(document.getElementById("root")!).render(
  <SidebarProvider>
    <App />
  </SidebarProvider>
);
