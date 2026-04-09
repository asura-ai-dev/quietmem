import { useEffect, useId, useState, type FormEvent } from "react";
import { useAgentStore } from "../../store/agentStore";
import { useUiStore } from "../../store/uiStore";
import type { Agent, AgentStatus, Worktree } from "../../types/bindings";
import AgentDuplicateConfirm from "./AgentDuplicateConfirm";
import {
  AGENT_STATUS_LABELS,
  AGENT_STATUS_VALUES,
  isAgentStatus,
} from "./agentStatus";
import styles from "./AgentEditForm.module.css";

/**
 * AgentEditForm
 *
 * 指定の Agent を編集するフォーム。
 * 編集可能フィールド: name / role / adapterType / status / activeWorktreeId。
 *
 * `activeWorktreeId` は渡された `worktrees` 一覧から `<select>` で選択する。
 * 空文字選択肢 (—) を選ぶと `activeWorktreeId: null` として送信し、Agent と
 * Worktree の紐付けを解除できる。Worktree が 0 件の場合は select を disabled
 * にし、ヒントメッセージ (「Worktree を先に作成してください」) を表示する。
 *
 * submit で `agentStore.updateAgent({ id: agent.id, ... })` を呼び、
 * 成功後に `refreshAgents(agent.projectId)` で一覧を再取得する
 * (store 側の updateAgent が内部で refreshAgents を呼ぶので、このフォームでは
 *  明示的な二重呼び出しは不要。チケット仕様通り「保存後 refreshAgents」の
 *  意味は既に担保されている)。
 *
 * バリデーション方針 (AgentCreateForm と揃える):
 * - 必須: name / role / adapterType (空欄はフロントで先検出)
 * - status は <select> で有効値を物理的に制限 (range 外不可。task-2C04)
 * - Rust 側の InvalidInput / DB エラーは submit 後に footer バナーで表示
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (AgentUpdateInput / バリデーション方針)
 * - tasks/phase-1F/task-1F04.md
 * - spec.md §4.7 / §5.1 / §9 (Agent 編集フォームで activeWorktreeId を選択)
 */

interface AgentEditFormProps {
  agent: Agent;
  // readonly to accept stable empty-array constants from zustand selectors
  // (see OverviewTab.tsx EMPTY_WORKTREES). The form only reads from this list.
  worktrees: readonly Worktree[];
  onSaved?: (agent: Agent) => void;
}

interface FieldErrors {
  name?: string;
  role?: string;
  adapterType?: string;
}

function AgentEditForm({ agent, worktrees, onSaved }: AgentEditFormProps) {
  const updateAgent = useAgentStore((state) => state.updateAgent);
  const duplicateAgent = useAgentStore((state) => state.duplicateAgent);
  const loading = useAgentStore((state) => state.loading);
  const storeError = useAgentStore((state) => state.error);
  const setSelectedAgentId = useUiStore((state) => state.setSelectedAgentId);

  const nameId = useId();
  const roleId = useId();
  const adapterTypeId = useId();
  const statusId = useId();
  const activeWorktreeId = useId();
  const worktreeHintId = useId();

  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [adapterType, setAdapterType] = useState(agent.adapterType);
  // DB 互換性フォールバック: 範囲外文字列が来ても "idle" に正規化する
  const initialStatus: AgentStatus = isAgentStatus(agent.status)
    ? agent.status
    : "idle";
  const [status, setStatus] = useState<AgentStatus>(initialStatus);
  // select の値は常に string。null は空文字で表現する。
  const [activeWorktreeValue, setActiveWorktreeValue] = useState<string>(
    agent.activeWorktreeId ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 複製確認 UI 用 state (task-2D02)
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [dupLoading, setDupLoading] = useState(false);
  const [dupError, setDupError] = useState<string | null>(null);

  // 親から別の agent が渡されたらフォーム state をリセットする
  // (AgentList で別の agent を選び直したケース)
  useEffect(() => {
    setName(agent.name);
    setRole(agent.role);
    setAdapterType(agent.adapterType);
    setStatus(isAgentStatus(agent.status) ? agent.status : "idle");
    setActiveWorktreeValue(agent.activeWorktreeId ?? "");
    setFieldErrors({});
    setSubmitError(null);
    // 複製 UI も agent 切替時にクリーンアップする (task-2D02)
    setShowDuplicate(false);
    setDupError(null);
    setDupLoading(false);
  }, [
    agent.id,
    agent.name,
    agent.role,
    agent.adapterType,
    agent.status,
    agent.activeWorktreeId,
  ]);

  const hasWorktrees = worktrees.length > 0;

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (name.trim().length === 0) {
      errors.name = "Agent 名を入力してください";
    }
    if (role.trim().length === 0) {
      errors.role = "Role を入力してください";
    }
    if (adapterType.trim().length === 0) {
      errors.adapterType = "Adapter Type を入力してください";
    }
    // status は <select> で有効値が固定されるためチェック不要 (task-2C04)
    return errors;
  };

  const clearSubmitError = () => {
    if (submitError !== null) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitError(null);

    try {
      const updated = await updateAgent({
        id: agent.id,
        name: name.trim(),
        role: role.trim(),
        adapterType: adapterType.trim(),
        // <select> で AgentStatus の有効値が固定されているため .trim や cast は不要
        status,
        // 空文字は null (紐付け解除) として送る
        activeWorktreeId:
          activeWorktreeValue.length > 0 ? activeWorktreeValue : null,
      });
      onSaved?.(updated);
    } catch (err) {
      const message =
        (err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : null) ??
        storeError ??
        "Agent の更新に失敗しました";
      setSubmitError(message);
    }
  };

  // --- 複製ハンドラ (task-2D02) ---
  const handleDuplicateClick = () => {
    setDupError(null);
    setShowDuplicate(true);
  };

  const handleDuplicateCancel = () => {
    if (dupLoading) return;
    setShowDuplicate(false);
    setDupError(null);
  };

  const handleDuplicateConfirm = async () => {
    setDupLoading(true);
    setDupError(null);
    try {
      const newAgent = await duplicateAgent({ sourceAgentId: agent.id });
      setShowDuplicate(false);
      // 新 Agent を編集対象に切り替える (spec.md §4.5)
      setSelectedAgentId(newAgent.id);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Agent の複製に失敗しました";
      setDupError(message);
    } finally {
      setDupLoading(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Agent edit form"
      noValidate
    >
      <header className={styles.formHeader}>
        <h3 className={styles.formTitle}>Edit Agent</h3>
        <div className={styles.formHeaderActions}>
          <span className={styles.formMeta}>id: {agent.id}</span>
          <button
            type="button"
            className={styles.duplicateButton}
            onClick={handleDuplicateClick}
            disabled={loading || dupLoading}
            aria-label={`${agent.name} を複製`}
          >
            複製
          </button>
        </div>
      </header>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={nameId}>
            Agent 名
          </label>
          <input
            id={nameId}
            type="text"
            className={
              fieldErrors.name
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
          />
          {fieldErrors.name && (
            <span id={`${nameId}-error`} className={styles.fieldError}>
              {fieldErrors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={roleId}>
            Role
          </label>
          <input
            id={roleId}
            type="text"
            className={
              fieldErrors.role
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (fieldErrors.role) {
                setFieldErrors((prev) => ({ ...prev, role: undefined }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.role)}
            aria-describedby={fieldErrors.role ? `${roleId}-error` : undefined}
          />
          {fieldErrors.role && (
            <span id={`${roleId}-error`} className={styles.fieldError}>
              {fieldErrors.role}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={adapterTypeId}>
            Adapter Type
          </label>
          <input
            id={adapterTypeId}
            type="text"
            className={
              fieldErrors.adapterType
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={adapterType}
            onChange={(e) => {
              setAdapterType(e.target.value);
              if (fieldErrors.adapterType) {
                setFieldErrors((prev) => ({
                  ...prev,
                  adapterType: undefined,
                }));
              }
              clearSubmitError();
            }}
            aria-invalid={Boolean(fieldErrors.adapterType)}
            aria-describedby={
              fieldErrors.adapterType ? `${adapterTypeId}-error` : undefined
            }
          />
          {fieldErrors.adapterType && (
            <span id={`${adapterTypeId}-error`} className={styles.fieldError}>
              {fieldErrors.adapterType}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={statusId}>
            Status
          </label>
          <select
            id={statusId}
            className={styles.select}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AgentStatus);
              clearSubmitError();
            }}
          >
            {AGENT_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {AGENT_STATUS_LABELS[v]}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor={activeWorktreeId}>
            Active Worktree
          </label>
          <select
            id={activeWorktreeId}
            className={styles.select}
            value={activeWorktreeValue}
            onChange={(e) => {
              setActiveWorktreeValue(e.target.value);
              clearSubmitError();
            }}
            disabled={!hasWorktrees}
            aria-describedby={worktreeHintId}
          >
            <option value="">— (未割当)</option>
            {worktrees.map((worktree) => (
              <option key={worktree.id} value={worktree.id}>
                {worktree.branchName} ({worktree.status})
              </option>
            ))}
          </select>
          <span id={worktreeHintId} className={styles.hint}>
            {hasWorktrees
              ? "空欄 (—) を選ぶと紐付けを解除します"
              : "Worktree がありません。Worktrees セクションで先に作成してください"}
          </span>
        </div>
      </div>

      {showDuplicate && (
        <AgentDuplicateConfirm
          agent={agent}
          loading={dupLoading}
          errorMessage={dupError}
          onCancel={handleDuplicateCancel}
          onConfirm={handleDuplicateConfirm}
        />
      )}

      <div className={styles.formFooter}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : (
          <span />
        )}
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "保存中…" : "変更を保存"}
        </button>
      </div>
    </form>
  );
}

export default AgentEditForm;
