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

!define initVariables '!insertmacro initVariablesImpl'
!macro initVariablesImpl
  Var /GLOBAL SI3_EXECUTABLE
  Var /GLOBAL SI4_EXECUTABLE
  StrCpy $SI3_EXECUTABLE "Insight3.exe"
  StrCpy $SI4_EXECUTABLE "sourceinsight4.exe"

  Var /GLOBAL SI3_LOCATION
  Var /GLOBAL SI4_LOCATION
  ReadRegDWORD $SI3_LOCATION HKLM 'SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\3.0\Paths' 'InitDir'
  ReadRegDWORD $SI4_LOCATION HKLM 'SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\4.0\Install' 'InstallDir'

  Var /GLOBAL RELEASE_PATH
  StrCpy $RELEASE_PATH "\\h3cbjnt23-fs\软件平台3\V7DEV\Comware Leopard 工具\SI插件"
!macroend

!define installProxy '!insertmacro installProxyImpl'
!macro installProxyImpl targetPath
  SetOutPath $targetPath
  File '${BUILD_RESOURCES_DIR}\build\assets\cmw-coder-loader.exe'
  File '${BUILD_RESOURCES_DIR}\build\assets\loaderdll.dll'
  File '${BUILD_RESOURCES_DIR}\build\assets\zlib1.dll'
  Sleep 3000
  nsExec::Exec '"$targetPath\cmw-coder-loader.exe" /uninstall'
  Sleep 3000
  nsExec::Exec '"$targetPath\cmw-coder-loader.exe" /install'
  SetOutPath $INSTDIR
!macroend

!macro customInit
  !initVariables

  DeleteRegKey HKCU 'Software\Source Dynamics\Source Insight\Installer'
  nsExec::Exec 'schtasks /delete /tn "cmw-coder-update" /f'
  nsProcess::_KillProcess 'cmw-coder-fastify.exe'
  RMDir /r /REBOOTOK 'C:\Windows\Temp\ComwareCoder'
  RMDir /r /REBOOTOK 'C:\Windows\Temp\SourceInsight'
  RMDir /r /REBOOTOK '$APPDATA\Source Insight'

  ${If} $SI3_LOCATION != ''
  ${AndIf} ${FileExists} '$SI3_LOCATION\$SI3_EXECUTABLE'
    CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\$SI3_EXECUTABLE' $SI3_LOCATION
  ${EndIf}
  ${If} $SI4_LOCATION != ''
  ${AndIf} ${FileExists} '$SI4_LOCATION\$SI4_EXECUTABLE'
    CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\$SI4_EXECUTABLE' $SI4_LOCATION
    CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\msimg32.dll' $SI4_LOCATION
    CopyFiles /FILESONLY /SILENT '$RELEASE_PATH\si4.lic' 'C:\ProgramData\Source Insight\4.0\si4.lic'
  ${EndIf}
!macroend

!macro customInstall
  ${If} $SI3_LOCATION != ''
  ${AndIf} ${FileExists} '$SI3_LOCATION\$SI3_EXECUTABLE'
    ${killIfRunning} '$SI3_EXECUTABLE'
    !installProxy $SI3_LOCATION
  ${EndIf}
  ${If} $SI4_LOCATION != ''
  ${AndIf} ${FileExists} '$SI4_LOCATION\$SI4_EXECUTABLE'
    ${killIfRunning} '$SI4_EXECUTABLE'
    !installProxy $SI4_LOCATION
  ${EndIf}
!macroend
