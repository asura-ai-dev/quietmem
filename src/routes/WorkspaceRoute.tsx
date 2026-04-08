import BottomDrawer from "../shell/BottomDrawer";
import Header from "../shell/Header";
import LeftSidebar from "../shell/LeftSidebar";
import MainTabs from "../shell/MainTabs";
import RightPanel from "../shell/RightPanel";
import { useUiStore } from "../store/uiStore";
import styles from "./WorkspaceRoute.module.css";

/**
 * WorkspaceRoute
 *
 * 5 領域 (Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer) を
 * CSS Grid で配置するシェルの骨格。
 * Header / LeftSidebar / RightPanel は task-1E02 で実体化済み。
 * MainTabs は task-1E03 で、BottomDrawer は task-1E04 で実体化済み。
 *
 * BottomDrawer の開閉に応じて grid の最終行を 32px / 272px (タブバー 32 + 内容 240)
 * に切り替える。
 *
 * 参照: agent-docs/ui-shell.md (レイアウトセクション)
 */
function WorkspaceRoute() {
  const drawerOpen = useUiStore((state) => state.drawerOpen);
  const drawerRowHeight = drawerOpen ? "272px" : "32px";

  return (
    <div
      className={styles.root}
      style={{ gridTemplateRows: `48px 1fr ${drawerRowHeight}` }}
    >
      <Header />
      <LeftSidebar />
      <MainTabs />
      <RightPanel />
      <BottomDrawer />
    </div>
  );
}

export default WorkspaceRoute;
