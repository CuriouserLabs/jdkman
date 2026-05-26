import { invoke } from "@tauri-apps/api/core";
import type {
  DiagnosticResult,
  DiscoveredJdk,
  EnvStatus,
  JavaVersion,
  ScanResult,
  UseResult,
  VerifyResult,
} from "./types";

export const listVersions = (): Promise<JavaVersion[]> =>
  invoke("list_versions");

export const addJdk = (alias: string, path: string): Promise<void> =>
  invoke("add_jdk", { alias, path });

export const removeJdk = (alias: string): Promise<void> =>
  invoke("remove_jdk", { alias });

export const useJdk = (alias: string): Promise<UseResult> =>
  invoke("use_jdk", { alias });

export const verifyJdk = (alias: string): Promise<VerifyResult> =>
  invoke("verify_jdk", { alias });

export const refreshJdk = (alias: string): Promise<void> =>
  invoke("refresh_jdk", { alias });

export const getEnvStatus = (): Promise<EnvStatus> =>
  invoke("get_env_status");

export const getCurrentAlias = (): Promise<string | null> =>
  invoke("get_current_alias");

export const scanJdks = (): Promise<ScanResult> => invoke("scan_jdks");

export const addDiscoveredJdk = (
  path: string,
  suggestedAlias: string
): Promise<string> =>
  invoke("add_discovered_jdk", { path, suggestedAlias });

export const addAllDiscovered = (jdks: DiscoveredJdk[]): Promise<string[]> =>
  invoke("add_all_discovered", { jdks });

export const runDiagnostics = (): Promise<DiagnosticResult> =>
  invoke("run_diagnostics");

export const getConfigPath = (): Promise<string> => invoke("get_config_path");

export const getConfigDir = (): Promise<string> => invoke("get_config_dir");

export const validateJdkPath = (path: string): Promise<void> =>
  invoke("validate_jdk_path", { path });

export const probeJdkMetadata = (
  path: string
): Promise<[string | null, string | null]> =>
  invoke("probe_jdk_metadata", { path });

export const getSuggestedAlias = (
  path: string,
  version?: string
): Promise<string> => invoke("get_suggested_alias", { path, version });

export const importJavaHome = (): Promise<[string, string] | null> =>
  invoke("import_java_home");
