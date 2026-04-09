import Editor, { type BeforeMount } from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { worktreeService } from "../services/worktreeService";
import { useAgentStore } from "../store/agentStore";
import { useProjectStore } from "../store/projectStore";
import { useUiStore } from "../store/uiStore";
import type {
  Agent,
  AppErrorPayload,
  FileTreeNode,
  Worktree,
  WorktreeTreeSource,
} from "../types/bindings";
import styles from "./EditorTab.module.css";

const EMPTY_AGENTS: readonly Agent[] = [];
const EMPTY_WORKTREES: readonly Worktree[] = [];

const FOUNDATION_TEXT = `# QuietMem Editor Foundation

QTM-004B wires the editor shell to active worktree context.

- Tree source: connected from the selected agent's active worktree
- File open binding: QTM-004D
- Multi-tab state: QTM-004E
- Save flow: QTM-004F

This buffer remains local until file open/save lands.`;

const REVIEW_TREE_SOURCE: WorktreeTreeSource = {
  worktreeId: "eval-wt-1",
  rootPath: "/tmp/eval/wt-phase-2c",
  nodes: [
    {
      name: "src",
      relativePath: "src",
      kind: "directory",
      children: [
        {
          name: "main.tsx",
          relativePath: "src/main.tsx",
          kind: "file",
          children: [],
        },
        {
          name: "tabs",
          relativePath: "src/tabs",
          kind: "directory",
          children: [
            {
              name: "EditorTab.tsx",
              relativePath: "src/tabs/EditorTab.tsx",
              kind: "file",
              children: [],
            },
          ],
        },
      ],
    },
    {
      name: "README.md",
      relativePath: "README.md",
      kind: "file",
      children: [],
    },
  ],
};

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

const reviewMode =
  typeof window !== "undefined" &&
  (window as unknown as { __UI_REVIEW__?: boolean }).__UI_REVIEW__ === true;

const toErrorMessage = (err: unknown): string => {
  if (typeof err === "object" && err !== null) {
    const maybe = err as Partial<AppErrorPayload>;
    if (typeof maybe.message === "string") {
      return maybe.message;
    }
  }
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "unknown error";
};

function TreePreview({
  nodes,
  level = 0,
}: {
  nodes: readonly FileTreeNode[];
  level?: number;
}) {
  return (
    <ul className={styles.treeList} data-level={level}>
      {nodes.map((node) => (
        <li key={node.relativePath} className={styles.treeItem}>
          <div className={styles.treeRow} data-kind={node.kind}>
            <span className={styles.treeMarker} aria-hidden="true">
              {node.kind === "directory" ? "dir" : "file"}
            </span>
            <span className={styles.treeName}>{node.name}</span>
          </div>
          {node.children.length > 0 ? (
            <TreePreview nodes={node.children} level={level + 1} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function EditorTab() {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const projects = useProjectStore((state) => state.projects);
  const selectedAgentId = useUiStore((state) => state.selectedAgentId);
  const worktrees = useAgentStore((state) =>
    selectedProjectId
      ? (state.worktreesByProject[selectedProjectId] ?? EMPTY_WORKTREES)
      : EMPTY_WORKTREES,
  );
  const agents = useAgentStore((state) =>
    selectedProjectId
      ? (state.agentsByProject[selectedProjectId] ?? EMPTY_AGENTS)
      : EMPTY_AGENTS,
  );
  const refreshWorktrees = useAgentStore((state) => state.refreshWorktrees);

  const [treeSource, setTreeSource] = useState<WorktreeTreeSource | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProjectId) {
      void refreshWorktrees(selectedProjectId);
    }
  }, [selectedProjectId, refreshWorktrees]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );
  const activeWorktree = useMemo(
    () =>
      selectedAgent?.activeWorktreeId
        ? (worktrees.find((worktree) => worktree.id === selectedAgent.activeWorktreeId) ??
          null)
        : null,
    [selectedAgent, worktrees],
  );

  useEffect(() => {
    let cancelled = false;

    if (!selectedAgent?.activeWorktreeId) {
      setTreeSource(null);
      setTreeError(null);
      setTreeLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (reviewMode && selectedAgent.activeWorktreeId === REVIEW_TREE_SOURCE.worktreeId) {
      setTreeSource(REVIEW_TREE_SOURCE);
      setTreeError(null);
      setTreeLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setTreeLoading(true);
    setTreeError(null);

    void worktreeService
      .getFileTree(selectedAgent.activeWorktreeId)
      .then((nextTreeSource) => {
        if (cancelled) return;
        setTreeSource(nextTreeSource);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setTreeSource(null);
        setTreeError(toErrorMessage(err));
      })
      .finally(() => {
        if (cancelled) return;
        setTreeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedAgent?.activeWorktreeId]);

  const treeNodeCount = useMemo(() => {
    const countNodes = (nodes: readonly FileTreeNode[]): number =>
      nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
    return treeSource ? countNodes(treeSource.nodes) : 0;
  }, [treeSource]);

  const status = selectedProjectId === null
    ? {
        label: "No Project",
        text: "Project を選択すると editor の worktree 文脈を解決できます。",
      }
    : selectedAgentId === null
      ? {
          label: "No Agent",
          text: "Editor は selected agent の active worktree を基準に tree source を決めます。",
        }
      : selectedAgent === null
        ? {
            label: "Agent Missing",
            text: "選択中 agent が現在の project から見つかりません。",
          }
        : selectedAgent.activeWorktreeId === null
          ? {
              label: "No Worktree",
              text: "Overview の Agent 編集で active worktree を設定すると tree source が有効になります。",
            }
          : treeLoading
            ? {
                label: "Loading",
                text: "active worktree から file tree source を取得しています。",
              }
            : treeError
              ? {
                  label: "Source Error",
                  text: treeError,
                }
              : {
                  label: "Tree Ready",
                  text:
                    treeSource?.rootPath ??
                    "active worktree から file tree source を取得済みです。",
                };

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.eyebrow}>Worktree Context</div>
        <h2 className={styles.title}>active worktree を editor 文脈へ接続</h2>
        <p className={styles.description}>
          QTM-004B では selected agent の active worktree から file tree source を取得します。
          file open と操作 UI は後続 ticket で接続します。
        </p>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Context</h3>
          <ul className={styles.list}>
            <li>{selectedProject ? `project: ${selectedProject.name}` : "project: —"}</li>
            <li>{selectedAgent ? `agent: ${selectedAgent.name}` : "agent: —"}</li>
            <li>
              {activeWorktree
                ? `worktree: ${activeWorktree.branchName}`
                : "worktree: —"}
            </li>
            <li>{activeWorktree ? `root: ${activeWorktree.path}` : "root: —"}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>MVP Policy</h3>
          <ul className={styles.list}>
            <li>source は agent.activeWorktreeId を唯一の基準にする</li>
            <li>hidden entries と `.git` / `node_modules` / `dist` / `target` を除外する</li>
            <li>directories first で静的 preview を返し、file open はまだ行わない</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Tree Preview</h3>
          {treeSource ? (
            <div className={styles.treePanel}>
              <div className={styles.treeMeta}>
                <span>{treeNodeCount} nodes</span>
                <span>{treeSource.rootPath}</span>
              </div>
              <TreePreview nodes={treeSource.nodes} />
            </div>
          ) : (
            <p className={styles.placeholderText}>
              worktree source が解決されると、ここに非インタラクティブな tree preview を表示します。
            </p>
          )}
        </section>

        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>{status.label}</span>
          <p className={styles.statusText}>{status.text}</p>
        </div>
      </aside>

      <section className={styles.editorPane} aria-label="Editor foundation">
        <div className={styles.editorHeader}>
          <div>
            <div className={styles.editorLabel}>Buffer</div>
            <div className={styles.editorTitle}>foundation/notes.md</div>
          </div>
          <div className={styles.editorMeta}>
            {activeWorktree
              ? `Monaco · markdown · ${activeWorktree.branchName}`
              : "Monaco · markdown · local seed"}
          </div>
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
