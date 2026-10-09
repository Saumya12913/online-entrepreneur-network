import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { applyTheme, storedTheme } from "./app/themes";
import "./styles/index.css";

// Paint the saved theme before the first render, so a reload never flashes the
// default colours.
applyTheme(storedTheme());

createRoot(document.getElementById("root")).render(<App />);
