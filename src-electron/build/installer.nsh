!define killIfRunning '!insertmacro killIfRunningImpl'
!macro killIfRunningImpl processName
  FLAGS_KillIfRunningImpl_Check_${processName}:
    nsProcess::_FindProcess '${processName}'
    Pop $R0
    ${If} $R0 = 0
      MessageBox MB_YESNO|MB_ICONEXCLAMATION 'One or more ${processName} are still running.$\nChoose Yes to close them all, or manually close them and choose No to try again' /SD IDYES IDNO FLAGS_KillIfRunningImpl_Check_${processName}
      FLAGS_KillIfRunningImpl_Perform_${processName}:
      nsProcess::_KillProcess '${processName}'
      Pop $R0
      Sleep 500
      ${If} $R0 = 0
      ${ElseIf} $R0 = 601
        MessageBox MB_OK|MB_ICONSTOP 'No permission to terminate process. Please run the installer as administrator'
        abort
      ${ElseIf} $R0 = 602
        Goto FLAGS_KillIfRunningImpl_Perform_${processName}
      ${ElseIf} $R0 = 603
      ${Else}
        MessageBox MB_YESNO|MB_ICONEXCLAMATION 'Unknown error occurred while trying to close ${processName}: $R0'
        abort
      ${EndIf}
    ${EndIf}
!macroend

!macro customInit
  Var /GLOBAL SI3_LOCATION
  Var /GLOBAL SI4_LOCATION
  ReadRegDWORD $SI3_LOCATION HKLM 'SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\3.0\Paths' 'InitDir'
  ReadRegDWORD $SI4_LOCATION HKLM 'SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\4.0\Install' 'InstallDir'

  ${ifNot} ${isUpdated}
    ${IfNot} ${FileExists} '$INSTDIR\resources.pak'
      Var /GLOBAL RELEASE_PATH
      StrCpy $RELEASE_PATH "\\h3cbjnt23-fs\软件平台3\V7DEV\Comware Leopard 工具\SI插件"

      DeleteRegKey HKCU 'Software\Source Dynamics\Source Insight\Installer'
      nsExec::Exec 'schtasks /delete /tn "cmw-coder-update" /f'
      nsProcess::_KillProcess 'cmw-coder-fastify.exe'
      RMDir /r /REBOOTOK 'C:\Windows\Temp\ComwareCoder'
      RMDir /r /REBOOTOK 'C:\Windows\Temp\SourceInsight'
      RMDir /r /REBOOTOK '$APPDATA\Source Insight'

      ${If} $SI3_LOCATION != ''
        CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\Insight3.exe' $SI3_LOCATION
      ${EndIf}
      ${If} $SI4_LOCATION != ''
        CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\msimg32.dll' $SI4_LOCATION
        CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\si4.lic' 'C:\ProgramData\Source Insight\4.0'
        CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\sourceinsight4.exe' $SI4_LOCATION
      ${EndIf}
    ${EndIf}
  ${endIf}
!macroend

!macro customInstall
  ${If} $SI3_LOCATION != ''
    ${killIfRunning} 'Insight3.exe'
    SetOutPath $SI3_LOCATION
    File '${BUILD_RESOURCES_DIR}\build\proxy\*'
    Sleep 500
    nsExec::Exec '"$SI3_LOCATION\cmw-coder-loader.exe" /uninstall'
    Sleep 500
    nsExec::Exec '"$SI3_LOCATION\cmw-coder-loader.exe" /install'
  ${EndIf}
  ${If} $SI4_LOCATION != ''
    ${killIfRunning} 'sourceinsight4.exe'
    SetOutPath $SI4_LOCATION
    File '${BUILD_RESOURCES_DIR}\build\proxy\*'
    Sleep 500
    nsExec::Exec '"$SI4_LOCATION\cmw-coder-loader.exe" /uninstall'
    Sleep 500
    nsExec::Exec '"$SI4_LOCATION\cmw-coder-loader.exe" /install'
  ${EndIf}
!macroend
