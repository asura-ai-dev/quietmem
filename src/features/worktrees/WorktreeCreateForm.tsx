import { useId, useState, type FormEvent } from "react";
import { useAgentStore } from "../../store/agentStore";
import type { Worktree } from "../../types/bindings";
import styles from "./WorktreeCreateForm.module.css";

/**
 * WorktreeCreateForm
 *
 * 指定 projectId 配下の Worktree を作成する。
 * フィールド: branchName / path / baseBranch (default "main")
 * / status (default "ready")。
 *
 * submit で `agentStore.createWorktree({ projectId, ... })` を呼び、
 * 成功したらフォームを初期値に戻し `onCreated(worktree)` を呼び出す。
 * store 側の createWorktree が成功時に refreshWorktrees を自動で呼ぶため、
 * このコンポーネントからは再取得しない。
 *
 * agentId はこの画面では設定しない (1F04 の AgentEditForm 側で
 * activeWorktreeId として紐付ける設計)。
 *
 * バリデーション方針 (AgentCreateForm / ProjectCreateForm と揃える):
 * - 必須: branchName / path / baseBranch (空欄はフロントで先検出)
 * - status は任意 (空欄なら DEFAULT_STATUS を送る)
 * - Rust 側の InvalidInput / DB エラーは submit 後に footer バナーで表示
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (WorktreeCreateInput / バリデーション方針)
 * - tasks/phase-1F/task-1F03.md
 * - spec.md §4.7 / §5.1 / §9 (Worktree 作成フォームの受け入れ条件)
 */

interface WorktreeCreateFormProps {
  projectId: string;
  onCreated?: (worktree: Worktree) => void;
}

interface FieldErrors {
  branchName?: string;
  path?: string;
  baseBranch?: string;
}

const DEFAULT_BASE_BRANCH = "main";
const DEFAULT_STATUS = "ready";

function WorktreeCreateForm({ projectId, onCreated }: WorktreeCreateFormProps) {
  const createWorktree = useAgentStore((state) => state.createWorktree);
  const loading = useAgentStore((state) => state.loading);
  const storeError = useAgentStore((state) => state.error);

  const branchNameId = useId();
  const pathId = useId();
  const baseBranchId = useId();
  const statusId = useId();
  const statusHintId = useId();

  const [branchName, setBranchName] = useState("");
  const [path, setPath] = useState("");
  const [baseBranch, setBaseBranch] = useState(DEFAULT_BASE_BRANCH);
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Server error shown after a submit attempt. Cleared on edit.
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (branchName.trim().length === 0) {
      errors.branchName = "Branch 名を入力してください";
    }
    if (path.trim().length === 0) {
      errors.path = "Path を入力してください";
    }
    if (baseBranch.trim().length === 0) {
      errors.baseBranch = "Base Branch を入力してください";
    }
    return errors;
  };

  const clearSubmitError = () => {
    if (submitError !== null) {
      setSubmitError(null);
    }
  };

  const resetForm = () => {
    setBranchName("");
    setPath("");
    setBaseBranch(DEFAULT_BASE_BRANCH);
    setStatus("");
    setFieldErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitError(null);

    const trimmedStatus = status.trim();

    try {
      const worktree = await createWorktree({
        projectId,
        branchName: branchName.trim(),
        path: path.trim(),
        baseBranch: baseBranch.trim(),
        status: trimmedStatus.length > 0 ? trimmedStatus : DEFAULT_STATUS,
      });
      resetForm();
      onCreated?.(worktree);
    } catch (err) {
      // agentStore already translated the error into its `error` state.
      // Snapshot it locally so it sticks even if another store action runs.
      const message =
        (err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : null) ??
        storeError ??
        "Worktree の作成に失敗しました";
      setSubmitError(message);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Worktree create form"
      noValidate
    >
      <header className={styles.formHeader}>
        <h3 className={styles.formTitle}>New Worktree</h3>
      </header>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={branchNameId}>
            Branch 名
          </label>
          <input
            id={branchNameId}
            type="text"
            className={
              fieldErrors.branchName
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={branchName}
            onChange={(e) => {
              setBranchName(e.target.value);
              if (fieldErrors.branchName) {
                setFieldErrors((prev) => ({ ...prev, branchName: undefined }));
              }
              clearSubmitError();
            }}
            placeholder="feature/new-task"
            aria-invalid={Boolean(fieldErrors.branchName)}
            aria-describedby={
              fieldErrors.branchName ? `${branchNameId}-error` : undefined
            }
          />
          {fieldErrors.branchName && (
            <span id={`${branchNameId}-error`} className={styles.fieldError}>
              {fieldErrors.branchName}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={baseBranchId}>
            Base Branch
          </label>
          <input
            id={baseBranchId}
            type="text"
            className={
              fieldErrors.baseBranch
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={baseBranch}
            onChange={(e) => {
              setBaseBranch(e.target.value);
              if (fieldErrors.baseBranch) {
                setFieldErrors((prev) => ({ ...prev, baseBranch: undefined }));
              }
              clearSubmitError();
            }}
            placeholder={DEFAULT_BASE_BRANCH}
            aria-invalid={Boolean(fieldErrors.baseBranch)}
            aria-describedby={
              fieldErrors.baseBranch ? `${baseBranchId}-error` : undefined
            }
          />
          {fieldErrors.baseBranch && (
            <span id={`${baseBranchId}-error`} className={styles.fieldError}>
              {fieldErrors.baseBranch}
            </span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor={pathId}>
            Path
          </label>
          <input
            id={pathId}
            type="text"
            className={
              fieldErrors.path
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              if (fieldErrors.path) {
                setFieldErrors((prev) => ({ ...prev, path: undefined }));
              }
              clearSubmitError();
            }}
            placeholder="/path/to/worktree"
            aria-invalid={Boolean(fieldErrors.path)}
            aria-describedby={fieldErrors.path ? `${pathId}-error` : undefined}
          />
          {fieldErrors.path && (
            <span id={`${pathId}-error`} className={styles.fieldError}>
              {fieldErrors.path}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={statusId}>
            Status
          </label>
          <input
            id={statusId}
            type="text"
            className={styles.input}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              clearSubmitError();
            }}
            placeholder={DEFAULT_STATUS}
            aria-describedby={statusHintId}
          />
          <span id={statusHintId} className={styles.hint}>
            省略時 "{DEFAULT_STATUS}"
          </span>
        </div>
      </div>

      <div className={styles.formFooter}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : (
          <span />
        )}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "作成中…" : "Worktree を作成"}
        </button>
      </div>
    </form>
  );
}

export default WorktreeCreateForm;
