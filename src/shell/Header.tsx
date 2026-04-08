import { useProjectStore } from "../store/projectStore";
import { useUiStore } from "../store/uiStore";
import styles from "./Header.module.css";

/**
 * Header
 *
 * Workspace Shell の上端帯 (grid-area: header)。
 * 左: sage dot + brand + tagline + subtle breadcrumb (選択中 project)
 * 右: Dashboard / Settings nav
 *
 * 参照:
 * - agent-docs/ui-shell.md (別画面方針、コンポーネント階層)
 * - tasks/phase-1E/task-1E02.md
 */
function Header() {
  const setRoute = useUiStore((state) => state.setRoute);
  const selectedId = useProjectStore((state) => state.selectedProjectId);
  const selected = useProjectStore((state) =>
    state.projects.find((p) => p.id === state.selectedProjectId),
  );

  return (
    <header className={styles.root}>
      <div className={styles.brandGroup}>
        <span className={styles.brandMark} aria-hidden="true" />
        <div className={styles.brand}>QuietMem</div>
        <div className={styles.tagline}>memory workspace</div>
        {selectedId && selected ? (
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbItem}>{selected.slug}</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbItem}>workspace</span>
          </div>
        ) : null}
      </div>
      <nav className={styles.nav} aria-label="Shell navigation">
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setRoute("dashboard")}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setRoute("settings")}
        >
          Settings
        </button>
      </nav>
    </header>
  );
}

export default Header;
