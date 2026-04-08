import { useId, useState, type FormEvent } from "react";
import { useProjectStore } from "../../store/projectStore";
import type { Project } from "../../types/bindings";
import styles from "./ProjectCreateForm.module.css";

/**
 * ProjectCreateForm
 *
 * name / slug / rootPath の 3 フィールドを持つ Project 作成フォーム。
 * submit で `projectStore.create({ name, slug, rootPath })` を呼び、
 * 成功したらフォームをリセットし `onCreated` を呼び出す。
 *
 * バリデーション方針:
 * - 空欄はフロントで先に検出 (Rust 側もバリデートするが UX 優先で先検出)
 * - slug は ASCII 英数 + `-` / `_` のみを許可 (Rust 側 `^[a-zA-Z0-9_-]+$` と一致)
 * - Rust 側の InvalidInput / DB エラーは projectStore.error 経由で表示
 *
 * エラー表示:
 * - フロント先検出エラーはフィールド直下の小さい赤系テキスト
 * - submit 後のサーバエラーは footer の赤系バナー (#c46a6a 系)
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (ProjectCreateInput / バリデーション方針)
 * - tasks/phase-1F/task-1F01.md
 * - spec.md §4.7 / §5.1 / §9 (Project 作成フォームの受け入れ条件)
 */

interface ProjectCreateFormProps {
  onCreated?: (project: Project) => void;
}

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

interface FieldErrors {
  name?: string;
  slug?: string;
  rootPath?: string;
}

function ProjectCreateForm({ onCreated }: ProjectCreateFormProps) {
  const create = useProjectStore((state) => state.create);
  const loading = useProjectStore((state) => state.loading);
  const storeError = useProjectStore((state) => state.error);

  const nameId = useId();
  const slugId = useId();
  const rootPathId = useId();
  const slugHintId = useId();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Server error shown after a submit attempt. Cleared on edit.
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (name.trim().length === 0) {
      errors.name = "Project 名を入力してください";
    }
    if (slug.trim().length === 0) {
      errors.slug = "Slug を入力してください";
    } else if (!SLUG_PATTERN.test(slug)) {
      errors.slug = "Slug は英数 / - / _ のみ使用できます";
    }
    if (rootPath.trim().length === 0) {
      errors.rootPath = "Root Path を入力してください";
    }
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
      const project = await create({
        name: name.trim(),
        slug: slug.trim(),
        rootPath: rootPath.trim(),
      });
      // Reset form on success.
      setName("");
      setSlug("");
      setRootPath("");
      setFieldErrors({});
      onCreated?.(project);
    } catch (err) {
      // projectStore already translated the error into its `error` state.
      // We also snapshot here for local component display so that the error
      // sticks even if another store action runs in the background.
      const message =
        (err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : null) ??
        storeError ??
        "Project の作成に失敗しました";
      setSubmitError(message);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Project create form"
      noValidate
    >
      <header className={styles.formHeader}>
        <h3 className={styles.formTitle}>New Project</h3>
      </header>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={nameId}>
            Project 名
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
            placeholder="My Project"
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
          <label className={styles.label} htmlFor={slugId}>
            Slug
          </label>
          <input
            id={slugId}
            type="text"
            className={
              fieldErrors.slug
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              if (fieldErrors.slug) {
                setFieldErrors((prev) => ({ ...prev, slug: undefined }));
              }
              clearSubmitError();
            }}
            placeholder="my-project"
            aria-invalid={Boolean(fieldErrors.slug)}
            aria-describedby={fieldErrors.slug ? `${slugId}-error` : slugHintId}
          />
          {fieldErrors.slug ? (
            <span id={`${slugId}-error`} className={styles.fieldError}>
              {fieldErrors.slug}
            </span>
          ) : (
            <span id={slugHintId} className={styles.hint}>
              英数 / - / _ のみ
            </span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldRootPath}`}>
          <label className={styles.label} htmlFor={rootPathId}>
            Root Path
          </label>
          <input
            id={rootPathId}
            type="text"
            className={
              fieldErrors.rootPath
                ? `${styles.input} ${styles.inputInvalid}`
                : styles.input
            }
            value={rootPath}
            onChange={(e) => {
              setRootPath(e.target.value);
              if (fieldErrors.rootPath) {
                setFieldErrors((prev) => ({ ...prev, rootPath: undefined }));
              }
              clearSubmitError();
            }}
            placeholder="/path/to/project"
            aria-invalid={Boolean(fieldErrors.rootPath)}
            aria-describedby={
              fieldErrors.rootPath ? `${rootPathId}-error` : undefined
            }
          />
          {fieldErrors.rootPath && (
            <span id={`${rootPathId}-error`} className={styles.fieldError}>
              {fieldErrors.rootPath}
            </span>
          )}
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
          {loading ? "作成中…" : "Project を作成"}
        </button>
      </div>
    </form>
  );
}

export default ProjectCreateForm;
