; PAJOY Uniforms POS - Custom NSIS Installer Script

; Modern UI
!include "MUI2.nsh"

; General
Name "PAJOY Uniforms POS"
OutFile "PAJOY-Uniforms-POS-Setup.exe"
InstallDir "$PROGRAMFILES\PAJOY Uniforms POS"
InstallDirRegKey HKLM "Software\PAJOY Uniforms POS" "InstallPath"
RequestExecutionLevel admin

; Variables
Var StartMenuFolder

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer Sections
Section "PAJOY Uniforms POS" SecCore

  SectionIn RO
  
  SetOutPath "$INSTDIR"
  
  ; Main application files
  File /r "electron\*"
  File /r "backend\*"
  File /r "database\*"
  File /r "scripts\*"
  File /r "frontend\dist\*"
  File "package.json"
  File ".env.example"
  
  ; Create .env file from example if it doesn't exist
  IfFileExists "$INSTDIR\.env" SkipEnv
    File "/oname=$INSTDIR\.env" ".env.example"
  SkipEnv:
  
  ; Store installation path
  WriteRegStr HKLM "Software\PAJOY Uniforms POS" "InstallPath" "$INSTDIR"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Add uninstaller to Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\PAJOY Uniforms POS" "DisplayName" "PAJOY Uniforms POS"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\PAJOY Uniforms POS" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\PAJOY Uniforms POS" "DisplayIcon" "$INSTDIR\icon.ico"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\PAJOY Uniforms POS" "Publisher" "PAJOY Uniforms"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\PAJOY Uniforms POS" "DisplayVersion" "${PRODUCT_VERSION}"
  
  ; Create Start Menu shortcuts
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\PAJOY Uniforms POS.lnk" "$INSTDIR\PAJOY Uniforms POS.exe" "" "$INSTDIR\icon.ico"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  !insertmacro MUI_STARTMENU_WRITE_END
  
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\PAJOY Uniforms POS.lnk" "$INSTDIR\PAJOY Uniforms POS.exe" "" "$INSTDIR\icon.ico"
  
  ; Register file associations (optional)
  WriteRegStr HKCR ".pajoy" "" "PAJOYDatabase"
  WriteRegStr HKCR "PAJOYDatabase" "" "PAJOY Database File"
  WriteRegStr HKCR "PAJOYDatabase\DefaultIcon" "" "$INSTDIR\icon.ico"
  
SectionEnd

; Uninstaller Section
Section "Uninstall"

  ; Remove files and folders
  RMDir /r "$INSTDIR\electron"
  RMDir /r "$INSTDIR\backend"
  RMDir /r "$INSTDIR\database"
  RMDir /r "$INSTDIR\scripts"
  RMDir /r "$INSTDIR\frontend"
  Delete "$INSTDIR\package.json"
  Delete "$INSTDIR\.env"
  Delete "$INSTDIR\.env.example"
  Delete "$INSTDIR\Uninstall.exe"
  Delete "$INSTDIR\icon.ico"
  Delete "$INSTDIR\PAJOY Uniforms POS.exe"
  
  ; Remove uninstaller registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\PAJOY Uniforms POS"
  DeleteRegKey HKLM "Software\PAJOY Uniforms POS"
  DeleteRegKey HKCR ".pajoy"
  DeleteRegKey HKCR "PAJOYDatabase"
  
  ; Remove Start Menu shortcuts
  !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
  Delete "$SMPROGRAMS\$StartMenuFolder\PAJOY Uniforms POS.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk"
  RMDir "$SMPROGRAMS\$StartMenuFolder"
  
  ; Remove desktop shortcut
  Delete "$DESKTOP\PAJOY Uniforms POS.lnk"
  
  ; Remove installation directory (only if empty)
  RMDir "$INSTDIR"

SectionEnd

; Component descriptions
LangString DESC_SecCore ${LANG_ENGLISH} "PAJOY Uniforms POS main application files"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecCore} $(DESC_SecCore)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Functions
Function .onInit
  ; Check for previous installation
  ReadRegStr $R0 HKLM "Software\PAJOY Uniforms POS" "InstallPath"
  StrCmp $R0 "" done
  
  MessageBox MB_YESNO "PAJOY Uniforms POS is already installed. $\n$\nDo you want to overwrite the existing installation?" IDYES done
  Abort
  
done:
FunctionEnd

Function un.onInit
  ; Check if application is running
  FindProcDLL::FindProc "PAJOY Uniforms POS.exe"
  Pop $R0
  IntCmp $R0 0 notRunning
  
  MessageBox MB_OKCANCEL "PAJOY Uniforms POS is currently running. $\n$\nPlease close the application and try again." IDOK unInstall
  Abort
  
notRunning:
FunctionEnd
