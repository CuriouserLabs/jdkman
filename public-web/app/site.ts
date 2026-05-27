export const SITE_URL = "https://jdkman.vercel.app";
export const SITE_NAME = "JDK Manager";
export const SITE_DESCRIPTION =
  "JDK Manager is a Windows-first Java version manager with a Rust CLI and desktop app for discovering JDKs, switching JAVA_HOME, fixing PATH issues, and managing multiple JDK versions.";
export const SITE_TAGLINE = "Windows-first Java version manager";
export const REPO_URL = "https://github.com/PrabathMadushan/jdkman";
export const DOWNLOAD_PATH = "/downloads/jdk-manager-windows-x64.msi";
export const DOWNLOAD_URL = `${SITE_URL}${DOWNLOAD_PATH}`;
export const GETTING_STARTED_PATH = "/getting-started";

export const PRIMARY_KEYWORDS = [
  "JDK Manager",
  "java version manager for windows",
  "jdk manager for windows",
  "switch JAVA_HOME",
  "manage multiple JDK versions on Windows",
  "fix Java PATH on Windows",
  "Windows Java version manager",
];

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
