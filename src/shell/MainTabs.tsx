import { useRef, type KeyboardEvent } from "react";
import { useUiStore, type MainTabKey } from "../store/uiStore";
import CronTab from "../tabs/CronTab";
import EditorTab from "../tabs/EditorTab";
import MemoryTab from "../tabs/MemoryTab";
import OverviewTab from "../tabs/OverviewTab";
import RunsTab from "../tabs/RunsTab";
import styles from "./MainTabs.module.css";

/**
 * MainTabs
 *
 * Overview / Editor / Memory / Runs / Cron の 5 タブを切り替える。
 * 現在タブは `useUiStore.activeTab` に同期し、クリック / ←→ キーで遷移できる。
 *
 * 参照:
 * - agent-docs/ui-shell.md (MainTabs 仕様 / アクセシビリティ)
 * - tasks/phase-1E/task-1E03.md
 *
 * A11y:
 * - `role="tablist"` / `role="tab"` / `role="tabpanel"`
 * - 選択中タブに `aria-selected="true"`
 * - ← / → キーで前後タブに移動し、フォーカスも移す
 */

const TABS: { key: MainTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "editor", label: "Editor" },
  { key: "memory", label: "Memory" },
  { key: "runs", label: "Runs" },
  { key: "cron", label: "Cron" },
];

function MainTabs() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const tabRefs = useRef<Record<MainTabKey, HTMLButtonElement | null>>({
    overview: null,
    editor: null,
    memory: null,
    runs: null,
    cron: null,
  });

  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);

  const focusTab = (key: MainTabKey) => {
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

    setActiveTab(nextKey);
    focusTab(nextKey);
  };

  const renderPanel = (): JSX.Element => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "editor":
        return <EditorTab />;
      case "memory":
        return <MemoryTab />;
      case "runs":
        return <RunsTab />;
      case "cron":
        return <CronTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <section className={styles.root} aria-label="Main content tabs">
      <div
        className={styles.tabBar}
        role="tablist"
        aria-label="Workspace tabs"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => {
          const selected = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              id={`main-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`main-tabpanel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabSelected : ""}`}
              onClick={() => setActiveTab(tab.key)}
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        className={styles.tabPanel}
        role="tabpanel"
        id={`main-tabpanel-${activeTab}`}
        aria-labelledby={`main-tab-${activeTab}`}
        tabIndex={0}
      >
        {renderPanel()}
      </div>
    </section>
  );
}

export default MainTabs;
