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

QTM-004D wires file open into the editor shell.

- Tree source: connected from the selected agent's active worktree
- File open binding: connected
- Multi-tab state: QTM-004E
- Save flow: QTM-004F

Select a text file from the tree to load it here.`;

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

const REVIEW_FILE_CONTENTS: Record<string, string> = {
  "README.md": "# QuietMem\n\nReview mode sample README.\n",
  "src/main.tsx":
    "export function bootstrap() {\n  return \"review-mode\";\n}\n",
  "src/tabs/EditorTab.tsx":
    "export const reviewMode = true;\n// QTM-004D sample content\n",
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

const inferMonacoLanguage = (path: string | null): string => {
  if (!path) return "markdown";

  const normalizedPath = path.toLowerCase();
  const segments = normalizedPath.split("/");
  const fileName = segments[segments.length - 1];

  if (fileName === "dockerfile") return "dockerfile";
  if (fileName.endsWith(".d.ts")) return "typescript";
  if (fileName === "package.json" || fileName.endsWith(".json")) return "json";
  if (fileName.endsWith(".md")) return "markdown";
  if (fileName.endsWith(".tsx")) return "typescript";
  if (fileName.endsWith(".ts")) return "typescript";
  if (fileName.endsWith(".jsx")) return "javascript";
  if (fileName.endsWith(".js") || fileName.endsWith(".mjs") || fileName.endsWith(".cjs")) {
    return "javascript";
  }
  if (fileName.endsWith(".rs")) return "rust";
  if (fileName.endsWith(".py")) return "python";
  if (fileName.endsWith(".sh")) return "shell";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".html")) return "html";
  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) return "yaml";
  if (fileName.endsWith(".xml")) return "xml";

  return "plaintext";
};

function TreePreview({
  nodes,
  expandedPaths,
  selectedFilePath,
  onToggleDirectory,
  onSelectFile,
  level = 0,
}: {
  nodes: readonly FileTreeNode[];
  expandedPaths: ReadonlySet<string>;
  selectedFilePath: string | null;
  onToggleDirectory: (path: string) => void;
  onSelectFile: (path: string) => void;
  level?: number;
}) {
  return (
    <ul className={styles.treeList} data-level={level}>
      {nodes.map((node) => {
        const isDirectory = node.kind === "directory";
        const isExpanded = isDirectory && expandedPaths.has(node.relativePath);
        const isSelected = !isDirectory && selectedFilePath === node.relativePath;

        return (
          <li key={node.relativePath} className={styles.treeItem}>
            <button
              type="button"
              className={styles.treeButton}
              data-kind={node.kind}
              data-selected={isSelected}
              aria-expanded={isDirectory ? isExpanded : undefined}
              aria-pressed={!isDirectory ? isSelected : undefined}
              onClick={() =>
                isDirectory
                  ? onToggleDirectory(node.relativePath)
                  : onSelectFile(node.relativePath)
              }
            >
              <span className={styles.treeChevron} aria-hidden="true">
                {isDirectory ? (isExpanded ? "▾" : "▸") : "·"}
              </span>
              <span className={styles.treeMarker} aria-hidden="true">
                {isDirectory ? "dir" : "file"}
              </span>
              <span className={styles.treeName}>{node.name}</span>
            </button>
            {isDirectory && isExpanded && node.children.length > 0 ? (
              <TreePreview
                nodes={node.children}
                expandedPaths={expandedPaths}
                selectedFilePath={selectedFilePath}
                onToggleDirectory={onToggleDirectory}
                onSelectFile={onSelectFile}
                level={level + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function EditorTab() {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const projects = useProjectStore((state) => state.projects);
  const selectedAgentId = useUiStore((state) => state.selectedAgentId);
  const pendingOpenFilePath = useUiStore((state) => state.pendingOpenFilePath);
  const setPendingOpenFilePath = useUiStore((state) => state.setPendingOpenFilePath);
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
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [openedFilePath, setOpenedFilePath] = useState<string | null>(null);
  const [editorValue, setEditorValue] = useState(FOUNDATION_TEXT);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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
      setExpandedPaths(new Set());
      setPendingOpenFilePath(null);
      setOpenedFilePath(null);
      setEditorValue(FOUNDATION_TEXT);
      setFileError(null);
      setFileLoading(false);
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

    setPendingOpenFilePath(null);
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
        setExpandedPaths(new Set());
        setPendingOpenFilePath(null);
      })
      .finally(() => {
        if (cancelled) return;
        setTreeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedAgent?.activeWorktreeId, setPendingOpenFilePath]);

  useEffect(() => {
    if (!treeSource) {
      setExpandedPaths(new Set());
      return;
    }

    setExpandedPaths(
      new Set(
        treeSource.nodes
          .filter((node) => node.kind === "directory")
          .map((node) => node.relativePath),
      ),
    );
  }, [treeSource]);

  const availableFilePaths = useMemo(() => {
    const paths = new Set<string>();
    const visit = (nodes: readonly FileTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.kind === "file") {
          paths.add(node.relativePath);
          return;
        }
        visit(node.children);
      });
    };
    if (treeSource) {
      visit(treeSource.nodes);
    }
    return paths;
  }, [treeSource]);

  useEffect(() => {
    if (pendingOpenFilePath && !availableFilePaths.has(pendingOpenFilePath)) {
      setPendingOpenFilePath(null);
    }
  }, [availableFilePaths, pendingOpenFilePath, setPendingOpenFilePath]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedAgent?.activeWorktreeId || !pendingOpenFilePath || !availableFilePaths.has(pendingOpenFilePath)) {
      if (!pendingOpenFilePath) {
        setOpenedFilePath(null);
        setEditorValue(FOUNDATION_TEXT);
        setFileError(null);
        setFileLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    if (openedFilePath === pendingOpenFilePath) {
      setFileError(null);
      setFileLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setFileLoading(true);
    setFileError(null);

    const loadPromise =
      reviewMode && selectedAgent.activeWorktreeId === REVIEW_TREE_SOURCE.worktreeId
        ? Promise.resolve({
            worktreeId: REVIEW_TREE_SOURCE.worktreeId,
            relativePath: pendingOpenFilePath,
            content:
              REVIEW_FILE_CONTENTS[pendingOpenFilePath] ??
              `// Review mode stub for ${pendingOpenFilePath}\n`,
          })
        : worktreeService.getFileContent(selectedAgent.activeWorktreeId, pendingOpenFilePath);

    void loadPromise
      .then((openedFile) => {
        if (cancelled) return;
        setOpenedFilePath(openedFile.relativePath);
        setEditorValue(openedFile.content);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setOpenedFilePath(null);
        setEditorValue(FOUNDATION_TEXT);
        setFileError(toErrorMessage(err));
      })
      .finally(() => {
        if (cancelled) return;
        setFileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [availableFilePaths, openedFilePath, pendingOpenFilePath, selectedAgent?.activeWorktreeId]);

  const treeNodeCount = useMemo(() => {
    const countNodes = (nodes: readonly FileTreeNode[]): number =>
      nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
    return treeSource ? countNodes(treeSource.nodes) : 0;
  }, [treeSource]);

  const handleToggleDirectory = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelectFile = (path: string) => {
    if (path === pendingOpenFilePath && path === openedFilePath) {
      return;
    }

    setPendingOpenFilePath(path);

    const segments = path.split("/");
    if (segments.length <= 1) {
      return;
    }

    setExpandedPaths((current) => {
      const next = new Set(current);
      const parents: string[] = [];
      for (let index = 0; index < segments.length - 1; index += 1) {
        parents.push(segments[index]);
        next.add(parents.join("/"));
      }
      return next;
    });
  };

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
              : fileLoading
                ? {
                    label: "Opening File",
                    text: `${pendingOpenFilePath ?? "selected file"} を読み込んでいます。`,
                  }
                : fileError
                  ? {
                      label: "Open Error",
                      text: fileError,
                    }
                  : openedFilePath
                ? {
                    label: "File Open",
                    text: `${openedFilePath} を editor に読み込みました。`,
                  }
              : {
                  label: "Tree Ready",
                  text:
                    treeSource?.rootPath ??
                    "active worktree から file tree source を取得済みです。",
                };

  const editorPath = openedFilePath ?? "foundation/notes.md";
  const editorLanguage = inferMonacoLanguage(openedFilePath);
  const bufferTitle = openedFilePath ?? pendingOpenFilePath ?? "foundation/notes.md";
  const editorMeta = openedFilePath
    ? `Monaco · ${editorLanguage} · ${openedFilePath}`
    : pendingOpenFilePath
      ? `Monaco · opening · ${pendingOpenFilePath}`
      : activeWorktree
        ? `Monaco · markdown · ${activeWorktree.branchName}`
      : "Monaco · markdown · local seed";

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.eyebrow}>Worktree Context</div>
        <h2 className={styles.title}>active worktree を editor 文脈へ接続</h2>
        <p className={styles.description}>
          QTM-004D では selected agent の active worktree から選択ファイルを読み込み、
          Monaco の buffer / path / language を open file に揃えます。
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
            <li>{pendingOpenFilePath ? `pending: ${pendingOpenFilePath}` : "pending: —"}</li>
            <li>{openedFilePath ? `opened: ${openedFilePath}` : "opened: —"}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>MVP Policy</h3>
          <ul className={styles.list}>
            <li>source は agent.activeWorktreeId を唯一の基準にする</li>
            <li>hidden entries と `.git` / `node_modules` / `dist` / `target` を除外する</li>
            <li>open は UTF-8 text file のみを扱い、非対応形式は error として返す</li>
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
              <TreePreview
                nodes={treeSource.nodes}
                expandedPaths={expandedPaths}
                selectedFilePath={pendingOpenFilePath}
                onToggleDirectory={handleToggleDirectory}
                onSelectFile={handleSelectFile}
              />
            </div>
          ) : (
            <p className={styles.placeholderText}>
              worktree source が解決されると、ここに展開可能な file tree を表示します。
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
            <div className={styles.editorTitle}>{bufferTitle}</div>
          </div>
          <div className={styles.editorMeta}>{editorMeta}</div>
        </div>
        <div className={styles.editorFrame}>
          <Editor
            beforeMount={configureMonaco}
            defaultLanguage="markdown"
            path={editorPath}
            language={editorLanguage}
            value={editorValue}
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
