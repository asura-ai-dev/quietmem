import Editor, { type BeforeMount } from "@monaco-editor/react";
import styles from "./EditorTab.module.css";

/**
 * EditorTab
 *
 * QTM-004A: Monaco ベースの editor foundation。
 *
 * file tree / worktree / file open/save は後続 ticket で接続する。
 */

const FOUNDATION_TEXT = `# QuietMem Editor Foundation

QTM-004A establishes the Monaco surface inside the workspace shell.

- File tree source: QTM-004B
- File open binding: QTM-004D
- Multi-tab state: QTM-004E
- Save flow: QTM-004F

This buffer is intentionally local to the UI foundation ticket.`;

const configureMonaco: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("quietmem", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8A8D8D" },
      { token: "string", foreground: "C8D8C6" },
      { token: "keyword", foreground: "F0C46B" },
    ],
    colors: {
      "editor.background": "#15181A",
      "editor.foreground": "#F4F5F5",
      "editor.lineHighlightBackground": "#1B1F22",
      "editorLineNumber.foreground": "#45494A",
      "editorLineNumber.activeForeground": "#8FA98A",
      "editorCursor.foreground": "#D99A2B",
      "editor.selectionBackground": "#425C4055",
      "editor.inactiveSelectionBackground": "#425C4033",
      "editorGutter.background": "#15181A",
      "editorIndentGuide.background1": "#24272A",
      "editorIndentGuide.activeBackground1": "#425C40",
    },
  });
};

function EditorTab() {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.eyebrow}>Editor Foundation</div>
        <h2 className={styles.title}>静かに書くための Monaco surface</h2>
        <p className={styles.description}>
          QTM-004A では workspace shell に Monaco を載せる最小構成だけを実装します。
          worktree 参照、file tree、open/save は後続 ticket で接続します。
        </p>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Current State</h3>
          <ul className={styles.list}>
            <li>Monaco editor is mounted and theme-configured.</li>
            <li>No worktree binding is required for this ticket.</li>
            <li>The editor is ready to accept opened file content later.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Next Tickets</h3>
          <ul className={styles.list}>
            <li>QTM-004B: worktree context and tree source</li>
            <li>QTM-004D: file open and language binding</li>
            <li>QTM-004E/F: tabs, dirty state, and save flow</li>
          </ul>
        </section>

        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Disconnected</span>
          <p className={styles.statusText}>
            File tree is not wired yet. The editor currently hosts a local
            foundation buffer so the shell and Monaco lifecycle can be verified.
          </p>
        </div>
      </aside>

      <section className={styles.editorPane} aria-label="Editor foundation">
        <div className={styles.editorHeader}>
          <div>
            <div className={styles.editorLabel}>Buffer</div>
            <div className={styles.editorTitle}>foundation/notes.md</div>
          </div>
          <div className={styles.editorMeta}>Monaco · markdown · local seed</div>
        </div>
        <div className={styles.editorFrame}>
          <Editor
            beforeMount={configureMonaco}
            defaultLanguage="markdown"
            defaultPath="foundation/notes.md"
            defaultValue={FOUNDATION_TEXT}
            theme="quietmem"
            options={{
              automaticLayout: true,
              fontFamily: '"SF Mono", Menlo, monospace',
              fontSize: 13,
              lineHeight: 20,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              roundedSelection: false,
              wordWrap: "on",
              tabSize: 2,
              padding: { top: 20, bottom: 20 },
              renderWhitespace: "selection",
              overviewRulerBorder: false,
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default EditorTab;
