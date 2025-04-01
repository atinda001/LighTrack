import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom CSS variables for our design
const style = document.createElement('style');
style.textContent = `
  :root {
    --background: 210 33% 98%;
    --foreground: 210 29% 24%;
    
    --card: 0 0% 100%;
    --card-foreground: 210 29% 24%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 210 29% 24%;
    
    --primary: 204 70% 53%;
    --primary-foreground: 0 0% 100%;
    
    --secondary: 210 33% 96%;
    --secondary-foreground: 210 29% 24%;
    
    --muted: 210 33% 96%;
    --muted-foreground: 210 10% 58%;
    
    --accent: 210 33% 96%;
    --accent-foreground: 210 29% 24%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 204 70% 53%;
    
    --chart-1: 145 63% 49%;
    --chart-2: 48 89% 50%;
    --chart-3: 6 78% 57%;
    --chart-4: 204 70% 53%;
    --chart-5: 267 83% 60%;
    
    --radius: 0.5rem;
    
    /* Custom variables for our app */
    --success: 145 63% 49%;
    --warning: 48 89% 50%;
    --critical: 6 78% 57%;
    --text-color: 210 29% 24%;
    --background-color: 210 33% 98%;
  }

  body {
    font-family: 'Roboto', sans-serif;
    color: hsl(var(--text-color));
    background-color: hsl(var(--background-color));
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
  }

  .status-active { background-color: hsl(var(--success)); }
  .status-warning { background-color: hsl(var(--warning)); }
  .status-critical { background-color: hsl(var(--critical)); }

  .map-container {
    height: calc(100vh - 200px);
    min-height: 400px;
  }
  @media (max-width: 768px) {
    .map-container {
      height: 50vh;
    }
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
