import ProjectCreateForm from "../features/projects/ProjectCreateForm";
import { useUiStore } from "../store/uiStore";
import styles from "./FirstRunRoute.module.css";

/**
 * FirstRunRoute
 *
 * Project が 0 件のときに表示される初回セットアップ画面。
 * 中央寄せのカードに、最初の Project を作成するためのフォームを配置する。
 *
 * task-1F01 で、従来の仮フォームを実体 <ProjectCreateForm /> に差し替えた。
 * 作成が成功すると `onCreated` から `setRoute("workspace")` を呼び、
 * Workspace Shell に遷移する。
 *
 * 参照:
 * - agent-docs/ui-shell.md (別画面方針 / FirstRunRoute セクション)
 * - tasks/phase-1F/task-1F01.md
 * - spec.md §4.5 別画面方針, §5.2 受け入れ条件, §9 (1〜4)
 */
function FirstRunRoute() {
  const setRoute = useUiStore((state) => state.setRoute);

  return (
    <div className={styles.root}>
      <main className={styles.card}>
        <header className={styles.header}>
          <span className={styles.headerBadge}>First Run</span>
          <h1 className={styles.title}>QuietMem へようこそ</h1>
          <p className={styles.subtitle}>
            まず最初の Project を作成して、ワークスペースを開始します。
          </p>
        </header>

        <ProjectCreateForm onCreated={() => setRoute("workspace")} />
      </main>
    </div>
  );
}

export default FirstRunRoute;
