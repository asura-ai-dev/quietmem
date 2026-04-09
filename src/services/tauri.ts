import { invoke } from "@tauri-apps/api/core";

type InvokeArgs = Record<string, unknown> | undefined;

interface AppErrorPayload {
  code: "not_found" | "invalid_input" | "db_error" | "io_error" | "internal";
  message: string;
}

const tauriUnavailableError = (): AppErrorPayload => ({
  code: "internal",
  message:
    "Tauri runtime is unavailable. Start the app with `pnpm tauri:dev` instead of plain Vite when backend commands are required.",
});

const hasTauriRuntime = (): boolean =>
  typeof window !== "undefined" &&
  typeof (window as Window & { __TAURI_INTERNALS__?: { invoke?: unknown } })
    .__TAURI_INTERNALS__?.invoke === "function";

export const safeInvoke = async <T>(
  command: string,
  args?: InvokeArgs,
): Promise<T> => {
  if (!hasTauriRuntime()) {
    throw tauriUnavailableError();
  }
  return invoke<T>(command, args);
};
