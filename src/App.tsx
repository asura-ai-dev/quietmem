import { useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import DashboardRoute from "./routes/DashboardRoute";
import FirstRunRoute from "./routes/FirstRunRoute";
import SettingsRoute from "./routes/SettingsRoute";
import WorkspaceRoute from "./routes/WorkspaceRoute";
import { useProjectStore } from "./store/projectStore";
import { useUiStore } from "./store/uiStore";

/**
 * App
 *
 * アプリの最上位コンポーネント。`useUiStore.route` の値に応じて
 * 4 つの画面 (firstRun / workspace / dashboard / settings) を切り替える。
 *
 * マウント時の初期化:
 * 1. `projectStore.refresh()` を 1 度だけ呼ぶ
 * 2. その結果 projects が 0 件で、かつ現在 route が "workspace" なら
 *    "firstRun" に遷移する (初回起動フロー)
 *
 * 参照:
 * - agent-docs/ui-shell.md (ルーティング戦略)
 * - tasks/phase-1E/task-1E05.md
 * - spec.md §4.5 別画面方針, §5.2 受け入れ条件
 */
function App() {
  const route = useUiStore((state) => state.route);
  const setRoute = useUiStore((state) => state.setRoute);
  const refreshProjects = useProjectStore((state) => state.refresh);
  const projects = useProjectStore((state) => state.projects);

  // 初回マウント時に Project 一覧を取得する。
  // 依存は空配列で意図的に 1 度だけ実行する。
  useEffect(() => {
    void refreshProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh 後に projects が 0 件で workspace ルートにいる場合、
  // firstRun に遷移させる。
  //
  // NOTE (ui-review only): Phase 1E の視覚評価時、FirstRun から
  // Workspace へ遷移したあと再び firstRun に戻ってしまうのを避けるため、
  // __UI_REVIEW__ フラグが立っているときだけガードを無効化する。
  useEffect(() => {
    const reviewMode =
      typeof window !== "undefined" &&
      (window as unknown as { __UI_REVIEW__?: boolean }).__UI_REVIEW__ === true;
    if (reviewMode) return;
    if (projects.length === 0 && route === "workspace") {
      setRoute("firstRun");
    }
  }, [projects, route, setRoute]);

  switch (route) {
    case "firstRun":
      return <FirstRunRoute />;
    case "dashboard":
      return <DashboardRoute />;
    case "settings":
      return <SettingsRoute />;
    case "workspace":
    default:
      return (
        <ErrorBoundary>
          <WorkspaceRoute />
        </ErrorBoundary>
      );
  }
}

export default App;
