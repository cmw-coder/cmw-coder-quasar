!define KillIfRunning '!insertmacro KillIfRunningImpl'
!macro KillIfRunningImpl processName
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

!define InitVariables '!insertmacro InitVariablesImpl'
!macro InitVariablesImpl
  Var /GLOBAL SI3_DATA_DIR
  Var /GLOBAL SI4_DATA_DIR
  StrCpy $SI3_DATA_DIR "$PROFILE\Documents\Source Insight"
  StrCpy $SI4_DATA_DIR "$PROFILE\Documents\Source Insight 4.0"

  Var /GLOBAL SI3_INSTALL_DIR
  Var /GLOBAL SI4_INSTALL_DIR
  ReadRegDWORD $SI3_INSTALL_DIR HKLM 'SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\3.0\Paths' 'InitDir'
  ReadRegDWORD $SI4_INSTALL_DIR HKLM 'SOFTWARE\WOW6432Node\Source Dynamics\Source Insight\4.0\Install' 'InstallDir'
!macroend

!define InstallProxy '!insertmacro InstallProxyImpl'
!macro InstallProxyImpl targetPath
  SetOutPath '${targetPath}'
    File '${BUILD_RESOURCES_DIR}\build\assets\cmw-coder-loader.exe'
    File '${BUILD_RESOURCES_DIR}\build\assets\loaderdll.dll'
    File '${BUILD_RESOURCES_DIR}\build\assets\zlib1.dll'
  SetOutPath '$INSTDIR'
  Sleep 3000
  nsExec::Exec '"${targetPath}\cmw-coder-loader.exe" /install'
!macroend

!macro customInit
  ${InitVariables}

  DeleteRegKey HKCU 'Software\Source Dynamics\Source Insight\Installer'
  nsExec::Exec 'schtasks /delete /tn "cmw-coder-update" /f'
  nsProcess::_KillProcess 'cmw-coder-fastify.exe'
  RMDir /r /REBOOTOK 'C:\Windows\Temp\ComwareCoder'
  RMDir /r /REBOOTOK 'C:\Windows\Temp\SourceInsight'
  RMDir /r /REBOOTOK '$APPDATA\Source Insight'

  ReadEnvStr $0 SystemRoot
  SetOutPath '$0'
    File '${BUILD_RESOURCES_DIR}\build\assets\ctags.exe'
  SetOutPath '$INSTDIR'
!macroend

!macro customInstall
  ${If} $SI3_INSTALL_DIR != ''
  ${AndIf} ${FileExists} '$SI3_INSTALL_DIR\Insight3.exe'
    ${If} 1
      ${KillIfRunning} 'Insight3.exe'
    ${EndIf}
    ${If} 1
      ${KillIfRunning} 'ctags.exe'
    ${EndIf}

    SetOutPath '$SI3_INSTALL_DIR'
      File '${BUILD_RESOURCES_DIR}\build\assets\Insight3.exe'
    SetOutPath '$INSTDIR'

    ${If} ${FileExists} '$SI3_DATA_DIR\Settings'
      CreateDirectory '$SI3_DATA_DIR\SettingsBackup'
      CopyFiles /FILESONLY /SILENT '$SI3_DATA_DIR\Settings\*.CF3' '$SI3_DATA_DIR\SettingsBackup'
    ${EndIf}
    ${If} ${FileExists} '$SI3_DATA_DIR\Projects\Base\CMWCODER.em'
      SetOutPath '$SI3_DATA_DIR\Projects\Base'
        File '${BUILD_RESOURCES_DIR}\build\assets\CMWCODER.em'
      SetOutPath '$INSTDIR'
    ${EndIf}

    ${InstallProxy} '$SI3_INSTALL_DIR'
  ${EndIf}
  ${If} $SI4_INSTALL_DIR != ''
  ${AndIf} ${FileExists} '$SI4_INSTALL_DIR\sourceinsight4.exe'
    ${If} 1
      ${KillIfRunning} 'sourceinsight4.exe'
    ${EndIf}
    ${If} 1
      ${KillIfRunning} 'ctags.exe'
    ${EndIf}

    SetOutPath '$SI4_INSTALL_DIR'
      File '${BUILD_RESOURCES_DIR}\build\assets\sourceinsight4.exe'
      File '${BUILD_RESOURCES_DIR}\build\assets\msimg32.dll'
    SetOutPath 'C:\ProgramData\Source Insight\4.0'
      File '${BUILD_RESOURCES_DIR}\build\assets\si4.lic'
    SetOutPath '$INSTDIR'

    ${If} ${FileExists} '$SI4_DATA_DIR\Settings'
      CreateDirectory '$SI4_DATA_DIR\SettingsBackup'
      CopyFiles /FILESONLY /SILENT '$SI4_DATA_DIR\Settings\*.xml' '$SI4_DATA_DIR\SettingsBackup'
    ${EndIf}
    ${If} ${FileExists} '$SI4_DATA_DIR\Projects\Base\CMWCODER.em'
      SetOutPath '$SI4_DATA_DIR\Projects\Base'
        File '${BUILD_RESOURCES_DIR}\build\assets\CMWCODER.em'
      SetOutPath '$INSTDIR'
    ${EndIf}

    ${InstallProxy} '$SI4_INSTALL_DIR'
  ${EndIf}
!macroend
