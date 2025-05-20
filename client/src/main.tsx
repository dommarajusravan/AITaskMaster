import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createContext } from "react";

// Create a root and render the app
createRoot(document.getElementById("root")!).render(<App />);
