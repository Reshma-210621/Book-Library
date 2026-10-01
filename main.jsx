import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SavedBooksProvider } from "./context/SavedBooksContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SavedBooksProvider>
        <App />
      </SavedBooksProvider>
    </BrowserRouter>
  </React.StrictMode>
);