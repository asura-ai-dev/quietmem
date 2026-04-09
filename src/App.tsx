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
 * 2. Project が 0 件でも Workspace へ入れる。作成導線は Workspace 内の
 *    Overview / LeftSidebar empty state から辿れるようにする。
 *
 * 参照:
 * - agent-docs/ui-shell.md (ルーティング戦略)
 * - tasks/phase-1E/task-1E05.md
 * - spec.md §4.5 別画面方針, §5.2 受け入れ条件
 */
function App() {
  const route = useUiStore((state) => state.route);
  const refreshProjects = useProjectStore((state) => state.refresh);

  // 初回マウント時に Project 一覧を取得する。
  // 依存は空配列で意図的に 1 度だけ実行する。
  useEffect(() => {
    void refreshProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
