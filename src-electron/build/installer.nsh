!define killIfRunning "!insertmacro killIfRunningImpl"
!macro killIfRunningImpl processName
  FLAGS_KillIfRunningImpl_Check_${processName}:
    nsProcess::_FindProcess "${processName}"
    Pop $R0
    ${If} $R0 = 0
      MessageBox MB_YESNO|MB_ICONEXCLAMATION "One or more ${processName} are still running.$\nChoose Yes to close them all, or manually close them and choose No to try again." /SD IDYES IDNO FLAGS_KillIfRunningImpl_Check_${processName}
      FLAGS_KillIfRunningImpl_Perform_${processName}:
      nsProcess::_KillProcess "${processName}"
      Pop $R0
      Sleep 500
      ${If} $R0 = 0
      ${ElseIf} $R0 = 601
        MessageBox MB_OK|MB_ICONSTOP "No permission to terminate process. Please run the installer as administrator."
        abort
      ${ElseIf} $R0 = 602
        Goto FLAGS_KillIfRunningImpl_Perform_${processName}
      ${ElseIf} $R0 = 603
      ${Else}
        MessageBox MB_YESNO|MB_ICONEXCLAMATION "Unknown error occurred while trying to close ${processName}: $R0"
        abort
      ${EndIf}
    ${EndIf}
!macroend

!macro customInstall
  Var /GLOBAL SI3_LOCATION
  Var /GLOBAL SI4_LOCATION
  ReadRegDWORD $SI3_LOCATION HKLM "SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\3.0\Paths" "InitDir"
  ReadRegDWORD $SI4_LOCATION HKLM "SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\4.0\Install" "InstallDir"

  ${If} $SI3_LOCATION != ""
    ${killIfRunning} "Insight3.exe"
    CopyFiles /FILESONLY "$INSTDIR\resources\assets\proxy\*" "$SI3_LOCATION"
    Sleep 500
    nsExec::Exec '"$SI3_LOCATION\cmw-coder-loader.exe" /uninstall'
    Sleep 500
    nsExec::Exec '"$SI3_LOCATION\cmw-coder-loader.exe" /install'
  ${EndIf}

  ${If} $SI4_LOCATION != ""
    ${killIfRunning} "sourceinsight4.exe"
    CopyFiles /FILESONLY "$INSTDIR\resources\assets\proxy\*" "$SI4_LOCATION"
    Sleep 500
    nsExec::Exec '"$SI4_LOCATION\cmw-coder-loader.exe" /uninstall'
    Sleep 500
    nsExec::Exec '"$SI4_LOCATION\cmw-coder-loader.exe" /install'
  ${EndIf}
!macroend
