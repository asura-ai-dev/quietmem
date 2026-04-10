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
const FOUNDATION_PATH = "foundation/notes.md";

type EditorOpenTab = {
  path: string;
  savedContent: string;
  currentContent: string;
};

const FOUNDATION_TEXT = `# QuietMem Editor Foundation

QTM-004D wires file open into the editor shell.

- Tree source: connected from the selected agent's active worktree
- File open binding: connected
- Multi-tab state: QTM-004E
- Save flow: QTM-004F active-tab save is wired

Select a text file from the tree to load it here.`;

const REVIEW_TREE_SOURCE: WorktreeTreeSource = {
  worktreeId: "eval-wt-1",
  rootPath: "/tmp/eval/wt-phase-2c",
  nodes: [
    {
      name: ".quietmem",
      relativePath: ".quietmem",
      kind: "directory",
      children: [
        {
          name: "prompts",
          relativePath: ".quietmem/prompts",
          kind: "directory",
          children: [
            {
              name: "summarize.prompt.md",
              relativePath: ".quietmem/prompts/summarize.prompt.md",
              kind: "file",
              children: [],
            },
          ],
        },
      ],
    },
    {
      name: "config",
      relativePath: "config",
      kind: "directory",
      children: [
        {
          name: "agent.yaml",
          relativePath: "config/agent.yaml",
          kind: "file",
          children: [],
        },
      ],
    },
    {
      name: "notes",
      relativePath: "notes",
      kind: "directory",
      children: [
        {
          name: "brainstorm.txt",
          relativePath: "notes/brainstorm.txt",
          kind: "file",
          children: [],
        },
      ],
    },
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
  ".quietmem/prompts/summarize.prompt.md":
    "# Summarize Prompt\n\nSummarize the last run in 3 bullets.\n",
  "config/agent.yaml":
    "model: gpt-5.4\nmax_tokens: 1200\nreview_mode: true\n",
  "notes/brainstorm.txt":
    "Ideas\n- validate prompt/config/text/code flows\n- capture MVP gaps\n",
  "src/main.tsx":
    "export function bootstrap() {\n  return \"review-mode\";\n}\n",
  "src/tabs/EditorTab.tsx":
    "export const reviewMode = true;\n// QTM-004D sample content\n",
};

const VALIDATION_SCENARIOS = [
  {
    label: "Prompt file",
    path: ".quietmem/prompts/summarize.prompt.md",
    detail: "Markdown prompt opens with language binding and can be edited/saved.",
  },
  {
    label: "Config file",
    path: "config/agent.yaml",
    detail: "YAML config opens as structured text and participates in dirty/save state.",
  },
  {
    label: "Text file",
    path: "notes/brainstorm.txt",
    detail: "Plain text file covers minimal UTF-8 text editing.",
  },
  {
    label: "Code file",
    path: "src/main.tsx",
    detail: "Code file verifies TS/JS language inference and normal tab flow.",
  },
] as const;

const KNOWN_GAPS = [
  "Worktree switch discards open tabs, including dirty buffers, without a confirmation step.",
  "Tabs are scoped in-memory only and are not restored across reloads or remapped by relative path.",
  "Only existing UTF-8 text files are supported; binary preview and file create/rename/delete remain out of scope.",
  "Save is active-tab only; save-all and external file change reconciliation are not implemented.",
] as const;

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
  const [openTabs, setOpenTabs] = useState<EditorOpenTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSaving, setFileSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const resetEditorStateForWorktree = () => {
    setTreeSource(null);
    setTreeError(null);
    setExpandedPaths(new Set());
    setPendingOpenFilePath(null);
    setOpenTabs([]);
    setActiveTabPath(null);
    setFileError(null);
    setFileLoading(false);
    setFileSaving(false);
    setSaveError(null);
  };

  useEffect(() => {
    let cancelled = false;

    resetEditorStateForWorktree();

    if (!selectedAgent?.activeWorktreeId) {
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

    if (
      !selectedAgent?.activeWorktreeId ||
      !pendingOpenFilePath ||
      !availableFilePaths.has(pendingOpenFilePath)
    ) {
      if (!pendingOpenFilePath) {
        setFileError(null);
        setFileLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    const existingTab = openTabs.find((tab) => tab.path === pendingOpenFilePath);
    if (existingTab) {
      setActiveTabPath(existingTab.path);
      setPendingOpenFilePath(null);
      setFileError(null);
      setFileLoading(false);
      setSaveError(null);
      return () => {
        cancelled = true;
      };
    }

    setFileLoading(true);
    setFileError(null);
    setSaveError(null);

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
        const nextTab: EditorOpenTab = {
          path: openedFile.relativePath,
          savedContent: openedFile.content,
          currentContent: openedFile.content,
        };
        setOpenTabs((current) => {
          if (current.some((tab) => tab.path === nextTab.path)) {
            return current;
          }
          return [...current, nextTab];
        });
        setActiveTabPath(openedFile.relativePath);
        setPendingOpenFilePath(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPendingOpenFilePath(null);
        setFileError(toErrorMessage(err));
      })
      .finally(() => {
        if (cancelled) return;
        setFileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [availableFilePaths, openTabs, pendingOpenFilePath, selectedAgent?.activeWorktreeId, setPendingOpenFilePath]);

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
    if (path === activeTabPath) {
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

  const handleActivateTab = (path: string) => {
    setActiveTabPath(path);
    setFileError(null);
    setSaveError(null);
    setPendingOpenFilePath(null);
  };

  const handleCloseTab = (path: string) => {
    const index = openTabs.findIndex((tab) => tab.path === path);
    if (index === -1) {
      return;
    }

    const fallbackTab = openTabs[index + 1] ?? openTabs[index - 1] ?? null;
    setOpenTabs((current) => current.filter((tab) => tab.path !== path));
    if (activeTabPath === path) {
      setActiveTabPath(fallbackTab?.path ?? null);
    }
    if (pendingOpenFilePath === path) {
      setPendingOpenFilePath(null);
    }
    setFileError(null);
    setSaveError(null);
  };

  const handleEditorChange = (nextValue: string | undefined) => {
    if (!activeTabPath) {
      return;
    }
    const normalizedValue = nextValue ?? "";
    setSaveError(null);
    setOpenTabs((current) =>
      current.map((tab) =>
        tab.path === activeTabPath ? { ...tab, currentContent: normalizedValue } : tab,
      ),
    );
  };

  const activeTab = activeTabPath
    ? openTabs.find((tab) => tab.path === activeTabPath) ?? null
    : null;
  const activeTabIsDirty = activeTab
    ? activeTab.currentContent !== activeTab.savedContent
    : false;
  const activeWorktreeId = selectedAgent?.activeWorktreeId ?? null;
  const canInterceptSaveShortcut = activeTab !== null && activeWorktreeId !== null;
  const canSaveActiveTab =
    activeTab !== null && activeWorktreeId !== null && activeTabIsDirty && !fileSaving;

  const handleSaveActiveTab = async () => {
    if (!activeTab || !activeWorktreeId || fileSaving) {
      return;
    }

    const contentToSave = activeTab.currentContent;
    if (contentToSave === activeTab.savedContent) {
      return;
    }

    setFileSaving(true);
    setFileError(null);
    setSaveError(null);

    const savePromise =
      reviewMode && activeWorktreeId === REVIEW_TREE_SOURCE.worktreeId
        ? Promise.resolve().then(() => {
            REVIEW_FILE_CONTENTS[activeTab.path] = contentToSave;
            return {
              worktreeId: activeWorktreeId,
              relativePath: activeTab.path,
              content: contentToSave,
            };
          })
        : worktreeService.saveFileContent({
            worktreeId: activeWorktreeId,
            relativePath: activeTab.path,
            content: contentToSave,
          });

    try {
      const savedFile = await savePromise;
      setOpenTabs((current) =>
        current.map((tab) =>
          tab.path === savedFile.relativePath
            ? { ...tab, savedContent: savedFile.content }
            : tab,
        ),
      );
    } catch (err: unknown) {
      setSaveError(toErrorMessage(err));
    } finally {
      setFileSaving(false);
    }
  };

  useEffect(() => {
    if (!canInterceptSaveShortcut) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveKey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s";
      if (!isSaveKey) {
        return;
      }

      event.preventDefault();
      if (!canSaveActiveTab) {
        return;
      }

      void handleSaveActiveTab();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canInterceptSaveShortcut, canSaveActiveTab, handleSaveActiveTab]);

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
                : fileSaving
                  ? {
                      label: "Saving",
                      text: `${activeTab?.path ?? "active file"} を保存しています。`,
                    }
                  : fileError
                    ? {
                        label: "Open Error",
                        text: fileError,
                      }
                    : saveError
                      ? {
                          label: "Save Error",
                          text: saveError,
                        }
                      : activeTab
                        ? {
                            label: activeTabIsDirty ? "Dirty" : "File Open",
                            text: activeTabIsDirty
                              ? `${activeTab.path} に未保存の変更があります。`
                              : `${activeTab.path} を editor に読み込みました。`,
                          }
                        : {
                            label: "Tree Ready",
                            text:
                              treeSource?.rootPath ??
                              "active worktree から file tree source を取得済みです。",
                          };

  const editorPath = activeTab?.path ?? FOUNDATION_PATH;
  const editorLanguage = inferMonacoLanguage(activeTab?.path ?? null);
  const bufferTitle = activeTab?.path ?? pendingOpenFilePath ?? FOUNDATION_PATH;
  const reviewedScenarios = VALIDATION_SCENARIOS.filter(({ path }) =>
    availableFilePaths.has(path),
  );
  const editorMeta = activeTab
    ? `Monaco · ${editorLanguage} · ${activeTab.path} · ${activeTabIsDirty ? "dirty" : "saved"}`
    : pendingOpenFilePath
      ? `Monaco · opening · ${pendingOpenFilePath}`
      : activeWorktree
        ? `Monaco · markdown · ${activeWorktree.branchName}`
      : "Monaco · markdown · local seed";
  const editorValue = activeTab?.currentContent ?? FOUNDATION_TEXT;

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.eyebrow}>Worktree Context</div>
        <h2 className={styles.title}>active worktree を editor 文脈へ接続</h2>
        <p className={styles.description}>
          QTM-004F では selected agent の active worktree へ active tab の変更を保存し、
          QTM-004G では worktree 切替時に tree / tabs / buffer を同期し、旧 worktree の内容を残しません。
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
            <li>{activeTab ? `active: ${activeTab.path}` : "active: —"}</li>
            <li>{`tabs: ${openTabs.length}`}</li>
            <li>{`save: ${fileSaving ? "saving" : activeTabIsDirty ? "dirty" : "idle"}`}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>MVP Policy</h3>
          <ul className={styles.list}>
            <li>source は agent.activeWorktreeId を唯一の基準にする</li>
            <li>hidden entries と `.git` / `node_modules` / `dist` / `target` を除外する</li>
            <li>open は UTF-8 text file のみを扱い、非対応形式は error として返す</li>
            <li>save は active tab の既存 UTF-8 text file のみを対象にする</li>
            <li>worktree 切替時は open tabs と pending open を破棄して新 source を再取得する</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Validation Coverage</h3>
          <div className={styles.validationPanel}>
            {reviewedScenarios.length > 0 ? (
              reviewedScenarios.map((scenario) => (
                <article key={scenario.path} className={styles.validationItem}>
                  <div className={styles.validationHeader}>
                    <span className={styles.validationLabel}>{scenario.label}</span>
                    <span className={styles.validationPath}>{scenario.path}</span>
                  </div>
                  <p className={styles.validationDetail}>{scenario.detail}</p>
                </article>
              ))
            ) : (
              <p className={styles.validationEmpty}>
                {reviewMode
                  ? "Review fixture を開くと、ここに prompt / config / text / code の確認対象が表示されます。"
                  : "selected agent の active worktree が解決され、対応するファイルが見つかると、ここに validation 対象を表示します。"}
              </p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Known Gaps</h3>
          <ul className={styles.list}>
            {KNOWN_GAPS.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
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
                selectedFilePath={activeTabPath}
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
        <div className={styles.editorTabs} aria-label="Editor file tabs">
          {openTabs.length > 0 ? (
            openTabs.map((tab) => {
              const isDirty = tab.currentContent !== tab.savedContent;
              const isActive = tab.path === activeTabPath;

              return (
                <div
                  key={tab.path}
                  className={styles.editorTabChip}
                  data-active={isActive}
                >
                  <button
                    type="button"
                    className={styles.editorTabButton}
                    aria-pressed={isActive}
                    onClick={() => handleActivateTab(tab.path)}
                  >
                    <span className={styles.editorTabName}>
                      {tab.path.split("/").at(-1) ?? tab.path}
                    </span>
                    {isDirty ? (
                      <span className={styles.editorDirtyMark} aria-label="Unsaved changes" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className={styles.editorTabClose}
                    aria-label={`${tab.path} を閉じる`}
                    onClick={() => handleCloseTab(tab.path)}
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <div className={styles.editorEmptyTabs}>Open files will appear here.</div>
          )}
        </div>
        <div className={styles.editorHeader}>
          <div>
            <div className={styles.editorLabel}>Buffer</div>
            <div className={styles.editorTitle}>{bufferTitle}</div>
          </div>
          <div className={styles.editorHeaderActions}>
            <div className={styles.editorMeta}>{editorMeta}</div>
            <button
              type="button"
              className={styles.saveButton}
              disabled={!canSaveActiveTab}
              aria-label="Save active file"
              onClick={() => {
                void handleSaveActiveTab();
              }}
            >
              {fileSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <div className={styles.editorFrame}>
          <Editor
            beforeMount={configureMonaco}
            defaultLanguage="markdown"
            path={editorPath}
            language={editorLanguage}
            value={editorValue}
            onChange={handleEditorChange}
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
