import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useProjectStore } from "./store/projectStore";
import { useUiStore } from "./store/uiStore";
import "./styles/tokens.css";
import "./styles/global.css";

// Dev-only: URL に ?review=1 があれば UI 評価モードを有効化し、
// Project ゼロでも workspace を描画できるようサンプル project を注入する。
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (params.get("review") === "1") {
    (window as unknown as { __UI_REVIEW__: boolean }).__UI_REVIEW__ = true;
    const now = new Date().toISOString();
    useProjectStore.setState({
      projects: [
        {
          id: "eval-project-1",
          name: "Eval Project",
          slug: "eval-project",
          root_path: "/tmp/eval",
          created_at: now,
          updated_at: now,
        },
        {
          id: "eval-project-2",
          name: "Notebook",
          slug: "notebook",
          root_path: "/tmp/notebook",
          created_at: now,
          updated_at: now,
        },
      ] as unknown as never,
      selectedProjectId: "eval-project-1",
      loading: false,
      error: null,
    });
    useUiStore.setState({ route: "workspace" });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
