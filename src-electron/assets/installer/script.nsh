!AddPluginDir ${BUILD_RESOURCES_DIR}\assets\installer\plugins

!macro customInstall
  Var /GLOBAL SI3_LOCATION
    Var /GLOBAL SI4_LOCATION
    ReadRegDWORD $SI3_LOCATION HKLM "SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\{070B0FBA-85F2-4647-BF00-7245E0C06709}" "InstallLocation"
    ReadRegDWORD $SI4_LOCATION HKLM "SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\{7D432AEC-4A5A-4D37-9062-D220266EF1B0}" "InstallLocation"

    CHECK_SI3:
      nsProcess::_FindProcess "Insight3.exe"
      Pop $R0
      ${If} $R0 = 0
        MessageBox MB_YESNO|MB_ICONEXCLAMATION "One or more Source Insight 3 instances are still running.$\nChoose Yes to close them all, or manually close them and choose No to try again." /SD IDYES IDNO CHECK_SI3
        KILL_SI3:
        nsProcess::_KillProcess "Insight3.exe"
        Pop $R0
        Sleep 500

        ${If} $R0 == 0
        ${ElseIf} $R0 == 601
          MessageBox MB_OK|MB_ICONSTOP "No permission to terminate process. Please run the installer as administrator."
          Abort
        ${ElseIf} $R0 == 602
          Goto KILL_SI3
        ${Else}
          MessageBox MB_YESNO|MB_ICONEXCLAMATION "Unknown error occurred while trying to close Source Insight 3: $R0"
          Abort
        ${EndIf}
      ${EndIf}
      Sleep 1000
      CopyFiles /FILESONLY "$INSTDIR\resources\assets\proxy\*" "$SI3_LOCATION"
      Sleep 1000
      nsExec::Exec '"$SI3_LOCATION\cmw-coder-loader.exe" /uninstall'
      Sleep 1000
      nsExec::Exec '"$SI3_LOCATION\cmw-coder-loader.exe" /install'

    CHECK_SI4:
        nsProcess::_FindProcess "Insight3.exe"
        Pop $R0
        ${If} $R0 = 0
          MessageBox MB_YESNO|MB_ICONEXCLAMATION "One or more Source Insight 4 instances are still running.$\nChoose Yes to close them all, or manually close them and choose No to try again." /SD IDYES IDNO CHECK_SI4
          KILL_SI4:
          nsProcess::_KillProcess "sourceinsight4.exe"
          Pop $R0
          Sleep 500

          ${If} $R0 == 0
          ${ElseIf} $R0 == 601
            MessageBox MB_OK|MB_ICONSTOP "No permission to terminate process. Please run the installer as administrator."
            Abort
          ${ElseIf} $R0 == 602
            Goto KILL_SI4
          ${Else}
            MessageBox MB_YESNO|MB_ICONEXCLAMATION "Unknown error occurred while trying to close Source Insight 4: $R0"
            Abort
          ${EndIf}
        ${EndIf}
        Sleep 1000
        CopyFiles /FILESONLY "$INSTDIR\resources\assets\proxy\*" "$SI4_LOCATION"
        Sleep 1000
        nsExec::Exec '"$SI4_LOCATION\cmw-coder-loader.exe" /uninstall'
        Sleep 1000
        nsExec::Exec '"$SI4_LOCATION\cmw-coder-loader.exe" /install'
!macroend
