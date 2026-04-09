import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { useAgentStore } from "./store/agentStore";
import { useProjectStore } from "./store/projectStore";
import { useUiStore } from "./store/uiStore";
import "./styles/tokens.css";
import "./styles/global.css";

// Dev-only: URL に ?review=1 があれば UI 評価モードを有効化し、
// Project / Agent / Worktree のサンプルデータを注入して workspace を描画する。
//
// Phase 1E では Project のみ注入していたが、Phase 2C の UI 評価
// (AgentStatusBadge 4 バリアント / LeftSidebar Agents 統合 / editForm status select /
//  LeftSidebar ↔ Overview の selectedAgentId 連動) を検証するため、
// Agent 4 件 (4 status 全種) + Worktree 1 件を合わせて注入する。
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (params.get("review") === "1") {
    (window as unknown as { __UI_REVIEW__: boolean }).__UI_REVIEW__ = true;
    const now = new Date().toISOString();
    const projectId = "eval-project-1";
    useProjectStore.setState({
      projects: [
        {
          id: projectId,
          name: "Eval Project",
          slug: "eval-project",
          rootPath: "/tmp/eval",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "eval-project-2",
          name: "Notebook",
          slug: "notebook",
          rootPath: "/tmp/notebook",
          createdAt: now,
          updatedAt: now,
        },
      ] as unknown as never,
      selectedProjectId: projectId,
      loading: false,
      error: null,
    });

    // Phase 2C review: 4 つの status (idle / running / error / needs_input) を
    // それぞれ持つ Agent を注入。LeftSidebar / AgentList 双方でバッジを視覚確認できる。
    const worktreeId = "eval-wt-1";
    useAgentStore.setState({
      agentsByProject: {
        [projectId]: [
          {
            id: "eval-agent-planner",
            projectId,
            name: "planner",
            role: "planner",
            adapterType: "cli",
            promptPath: null,
            configPath: null,
            status: "idle",
            activeWorktreeId: null,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "eval-agent-generator",
            projectId,
            name: "generator",
            role: "generator",
            adapterType: "cli",
            promptPath: null,
            configPath: null,
            status: "running",
            activeWorktreeId: worktreeId,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "eval-agent-evaluator",
            projectId,
            name: "evaluator",
            role: "evaluator",
            adapterType: "cli",
            promptPath: null,
            configPath: null,
            status: "needs_input",
            activeWorktreeId: null,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: "eval-agent-orchestrator",
            projectId,
            name: "orchestrator",
            role: "orchestrator",
            adapterType: "cli",
            promptPath: null,
            configPath: null,
            status: "error",
            activeWorktreeId: null,
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      worktreesByProject: {
        [projectId]: [
          {
            id: worktreeId,
            projectId,
            agentId: "eval-agent-generator",
            branchName: "feature/phase-2c",
            path: "/tmp/eval/wt-phase-2c",
            baseBranch: "main",
            status: "active",
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      loading: false,
      error: null,
    } as unknown as never);

    useUiStore.setState({ route: "workspace" });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
