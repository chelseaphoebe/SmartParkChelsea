import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#1f2937",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #e5e7eb",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "#f0f9ff",
              border: "1px solid #0ea5e9",
              color: "#0c4a6e",
            },
            iconTheme: {
              primary: "#0ea5e9",
              secondary: "#f0f9ff",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              border: "1px solid #ef4444",
              color: "#7f1d1d",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
