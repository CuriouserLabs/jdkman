export interface JavaVersion {
  alias: string;
  path: string;
  detected_version: string | null;
  vendor: string | null;
  is_current: boolean;
  is_valid: boolean;
}

export interface JdkEntry {
  path: string;
  detected_version: string | null;
  vendor: string | null;
}

export interface DiscoveredJdk {
  path: string;
  detected_version: string | null;
  vendor: string | null;
  suggested_alias: string;
  already_configured: boolean;
}

export interface ScanResult {
  found: DiscoveredJdk[];
}

export interface DiagnosticCheck {
  name: string;
  status: "Ok" | "Warning" | "Error";
  message: string;
  suggestion: string | null;
}

export interface DiagnosticResult {
  checks: DiagnosticCheck[];
}

export interface VerifyResult {
  alias: string;
  java_version_output: string | null;
  javac_version_output: string | null;
  path_valid: boolean;
}

export interface EnvStatus {
  java_home: string | null;
  java_home_valid: boolean;
  current_alias: string | null;
  java_in_path: string | null;
  java_version_output: string | null;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}
