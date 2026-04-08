import { useRef, type KeyboardEvent } from "react";
import { useUiStore, type DrawerTabKey } from "../store/uiStore";
import styles from "./BottomDrawer.module.css";

/**
 * BottomDrawer
 *
 * 画面下部の 4 タブ (diff / logs / problems / output) と開閉トグル。
 * 常にタブバー (32px) は表示され、トグルで展開領域 (240px) が開く。
 *
 * 参照:
 * - agent-docs/ui-shell.md (BottomDrawer セクション)
 * - tasks/phase-1E/task-1E04.md
 *
 * A11y:
 * - タブは `role="tablist"` / `role="tab"` / `role="tabpanel"` + `aria-selected`
 * - ← / → キーでタブ移動
 * - 開閉トグルは `button` 要素に `aria-expanded`
 * - 閉じているときは tabpanel をレンダリングしない
 */

const TABS: { key: DrawerTabKey; label: string }[] = [
  { key: "diff", label: "Diff" },
  { key: "logs", label: "Logs" },
  { key: "problems", label: "Problems" },
  { key: "output", label: "Output" },
];

const DRAWER_HINTS: Record<DrawerTabKey, string> = {
  diff: "変更内容を表示するパネルです。git 操作と diff viewer は QTM-007 で接続されます。",
  logs: "実行ログのライブ追従パネルです。Adapter と Run が接続される QTM-006 で使われ始めます。",
  problems: "型エラーや静的解析の警告をここに集約する予定です。",
  output: "コマンド出力と stdout を落ち着いた等幅で流す領域です。",
};

function BottomDrawer() {
  const drawerOpen = useUiStore((state) => state.drawerOpen);
  const drawerTab = useUiStore((state) => state.drawerTab);
  const setDrawerTab = useUiStore((state) => state.setDrawerTab);
  const toggleDrawer = useUiStore((state) => state.toggleDrawer);

  const tabRefs = useRef<Record<DrawerTabKey, HTMLButtonElement | null>>({
    diff: null,
    logs: null,
    problems: null,
    output: null,
  });

  const activeIndex = TABS.findIndex((tab) => tab.key === drawerTab);

  const focusTab = (key: DrawerTabKey) => {
    const el = tabRefs.current[key];
    if (el) {
      el.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();

    const delta = event.key === "ArrowRight" ? 1 : -1;
    const currentIndex = activeIndex === -1 ? 0 : activeIndex;
    const nextIndex = (currentIndex + delta + TABS.length) % TABS.length;
    const nextKey = TABS[nextIndex].key;

    setDrawerTab(nextKey);
    focusTab(nextKey);
  };

  return (
    <section
      className={styles.root}
      aria-label="Bottom drawer"
      data-open={drawerOpen}
    >
      <div className={styles.tabBar}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Drawer tabs"
          onKeyDown={handleKeyDown}
        >
          {TABS.map((tab) => {
            const selected = tab.key === drawerTab;
            return (
              <button
                key={tab.key}
                id={`drawer-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`drawer-tabpanel-${tab.key}`}
                tabIndex={selected ? 0 : -1}
                className={`${styles.tab} ${selected ? styles.tabSelected : ""}`}
                onClick={() => setDrawerTab(tab.key)}
                ref={(el) => {
                  tabRefs.current[tab.key] = el;
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={styles.toggle}
          onClick={toggleDrawer}
          aria-expanded={drawerOpen}
          aria-controls={`drawer-tabpanel-${drawerTab}`}
          aria-label={drawerOpen ? "Collapse drawer" : "Expand drawer"}
          title={drawerOpen ? "Collapse drawer" : "Expand drawer"}
        >
          {drawerOpen ? "\u25BC" : "\u25B2"}
        </button>
      </div>
      {drawerOpen ? (
        <div
          className={styles.panel}
          role="tabpanel"
          id={`drawer-tabpanel-${drawerTab}`}
          aria-labelledby={`drawer-tab-${drawerTab}`}
          tabIndex={0}
        >
          <div className={styles.panelInner}>
            <div className={styles.panelEyebrow}>{drawerTab}</div>
            <p className={styles.panelHint}>{DRAWER_HINTS[drawerTab]}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default BottomDrawer;
