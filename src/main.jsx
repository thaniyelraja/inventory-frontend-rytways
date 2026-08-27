import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ConfigProvider } from "antd";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import InventoryRequestProvider from "./context/InventoryRequestProvider.jsx";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <InventoryRequestProvider>
          <App />
        </InventoryRequestProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
