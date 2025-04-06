import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Material Icons
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

// Import Inter font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Set page title
document.title = "EpiCircle MCP";

createRoot(document.getElementById("root")!).render(<App />);
