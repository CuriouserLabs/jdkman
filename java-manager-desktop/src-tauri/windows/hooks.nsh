!include "WinMessages.nsh"

!macro NSIS_HOOK_POSTINSTALL
  MessageBox MB_YESNO|MB_ICONQUESTION "Install the jdkman CLI and add it to your PATH?$\r$\n$\r$\nChoose 'No' to install only the desktop app." IDYES install_cli IDNO skip_cli

  install_cli:
    DetailPrint "Adding jdkman CLI to the user PATH"
    nsExec::ExecToLog '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "$cliDir = [System.IO.Path]::GetFullPath(''$INSTDIR\resources''); $path = [Environment]::GetEnvironmentVariable(''Path'', ''User''); $parts = @(); if ($path) { $parts = $path -split '';'' | Where-Object { $_ -and $_.Trim() -ne '''' } }; if (-not ($parts | Where-Object { $_.TrimEnd(''\'') -ieq $cliDir.TrimEnd(''\'') })) { [Environment]::SetEnvironmentVariable(''Path'', ((@($cliDir) + $parts) -join '';''), ''User'') }"'
    Goto cli_done

  skip_cli:
    DetailPrint "Skipping jdkman CLI install"
    Delete "$INSTDIR\resources\jdkman.exe"

  cli_done:
    System::Call 'user32::SendMessageTimeoutW(p 0xffff, i ${WM_SETTINGCHANGE}, p 0, t "Environment", i 0, i 5000, *i .r0)'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  DetailPrint "Removing jdkman CLI from the user PATH"
  nsExec::ExecToLog '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "$cliDir = [System.IO.Path]::GetFullPath(''$INSTDIR\resources''); $path = [Environment]::GetEnvironmentVariable(''Path'', ''User''); if ($null -ne $path) { $parts = $path -split '';'' | Where-Object { $_ -and $_.Trim() -ne '''' -and $_.TrimEnd(''\'') -ine $cliDir.TrimEnd(''\'') }; [Environment]::SetEnvironmentVariable(''Path'', ($parts -join '';''), ''User'') }"'
  System::Call 'user32::SendMessageTimeoutW(p 0xffff, i ${WM_SETTINGCHANGE}, p 0, t "Environment", i 0, i 5000, *i .r0)'
!macroend
