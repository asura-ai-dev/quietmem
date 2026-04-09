import { useId, useState, type FormEvent } from "react";
import { useAgentStore } from "../../store/agentStore";
import type { Agent, AgentStatus } from "../../types/bindings";
import { AGENT_STATUS_LABELS, AGENT_STATUS_VALUES } from "./agentStatus";
import styles from "./AgentCreateForm.module.css";

/**
 * AgentCreateForm
 *
 * 指定 projectId 配下の Agent を作成する。
 * フィールド: name / role / adapterType (default "cli") / promptPath?
 * / configPath? / status? (default "idle")。
 *
 * submit で `agentStore.createAgent({ projectId, ... })` を呼び、
 * 成功したらフォームを初期値に戻し `onCreated(agent)` を呼び出す。
 *
 * バリデーション方針 (ProjectCreateForm と揃える):
 * - 必須: name / role / adapterType (空欄はフロントで先検出)
 * - promptPath / configPath / status は任意 (空欄なら送らない)
 * - Rust 側の InvalidInput / DB エラーは submit 後に footer バナーで表示
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (AgentCreateInput / バリデーション方針)
 * - tasks/phase-1F/task-1F02.md
 * - spec.md §4.7 / §5.1 / §9 (Agent 作成フォームの受け入れ条件)
 */

interface AgentCreateFormProps {
  projectId: string;
  onCreated?: (agent: Agent) => void;
}

interface FieldErrors {
  name?: string;
  role?: string;
  adapterType?: string;
}

const DEFAULT_ADAPTER_TYPE = "cli";

function AgentCreateForm({ projectId, onCreated }: AgentCreateFormProps) {
  const createAgent = useAgentStore((state) => state.createAgent);
  const loading = useAgentStore((state) => state.loading);
  const storeError = useAgentStore((state) => state.error);

  const nameId = useId();
  const roleId = useId();
  const adapterTypeId = useId();
  const promptPathId = useId();
  const configPathId = useId();
  const statusId = useId();
  const statusHintId = useId();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [adapterType, setAdapterType] = useState(DEFAULT_ADAPTER_TYPE);
  const [promptPath, setPromptPath] = useState("");
  const [configPath, setConfigPath] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Server error shown after a submit attempt. Cleared on edit.
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    return errors;
  };

  const clearSubmitError = () => {
    if (submitError !== null) {
      setSubmitError(null);
    }
  };

  const resetForm = () => {
    setName("");
    setRole("");
    setAdapterType(DEFAULT_ADAPTER_TYPE);
    setPromptPath("");
    setConfigPath("");
    setStatus("idle");
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

    const trimmedPromptPath = promptPath.trim();
    const trimmedConfigPath = configPath.trim();

    try {
      const agent = await createAgent({
        projectId,
        name: name.trim(),
        role: role.trim(),
        adapterType: adapterType.trim(),
        promptPath: trimmedPromptPath.length > 0 ? trimmedPromptPath : null,
        configPath: trimmedConfigPath.length > 0 ? trimmedConfigPath : null,
        // status は select で必ず AgentStatus の有効値が入っているため
        // trim や fallback は不要。
        status,
      });
      resetForm();
      onCreated?.(agent);
    } catch (err) {
      // agentStore already translated the error into its `error` state.
      // Snapshot it locally so it sticks even if another store action runs.
      const message =
        (err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : null) ??
        storeError ??
        "Agent の作成に失敗しました";
      setSubmitError(message);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Agent create form"
      noValidate
    >
      <header className={styles.formHeader}>
        <h3 className={styles.formTitle}>New Agent</h3>
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
            placeholder="Planner"
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
            placeholder="planner"
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
            placeholder="cli"
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
            aria-describedby={statusHintId}
          >
            {AGENT_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {AGENT_STATUS_LABELS[v]}
              </option>
            ))}
          </select>
          <span id={statusHintId} className={styles.hint}>
            作成直後の状態 (デフォルト: idle)
          </span>
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor={promptPathId}>
            Prompt Path <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id={promptPathId}
            type="text"
            className={styles.input}
            value={promptPath}
            onChange={(e) => {
              setPromptPath(e.target.value);
              clearSubmitError();
            }}
            placeholder="projects/<id>/agents/<id>/prompt/main.md"
          />
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor={configPathId}>
            Config Path <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id={configPathId}
            type="text"
            className={styles.input}
            value={configPath}
            onChange={(e) => {
              setConfigPath(e.target.value);
              clearSubmitError();
            }}
            placeholder="projects/<id>/agents/<id>/config/agent.json"
          />
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
          {loading ? "作成中…" : "Agent を作成"}
        </button>
      </div>
    </form>
  );
}

export default AgentCreateForm;
