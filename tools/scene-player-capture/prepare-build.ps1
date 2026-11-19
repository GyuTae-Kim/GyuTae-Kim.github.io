# The public player repository tracks the sources but not the Visual Studio template files under
# src/Properties that its project file lists. Recreate those template files so the project builds.
# They hold no application logic.
param(
    [Parameter(Mandatory = $true)][string]$Source
)

$ErrorActionPreference = 'Stop'
$properties = Join-Path $Source 'Properties'
$null = New-Item -ItemType Directory -Force -Path $properties

function Set-Template {
    param([string]$Name, [string]$Content)
    $path = Join-Path $properties $Name
    if (Test-Path $path) { return }
    [System.IO.File]::WriteAllText($path, $Content, (New-Object System.Text.UTF8Encoding($true)))
    Write-Host "created $path"
}

Set-Template 'AssemblyInfo.cs' @'
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows;

[assembly: AssemblyTitle("WpfApp1")]
[assembly: AssemblyProduct("WpfApp1")]
[assembly: ComVisible(false)]
[assembly: ThemeInfo(ResourceDictionaryLocation.None, ResourceDictionaryLocation.SourceAssembly)]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]
'@

Set-Template 'Resources.Designer.cs' @'
// Template placeholder: the project defines no resources.
'@

Set-Template 'Settings.Designer.cs' @'
// Template placeholder: the project defines no settings.
'@

Set-Template 'Resources.resx' @'
<?xml version="1.0" encoding="utf-8"?>
<root>
  <resheader name="resmimetype">
    <value>text/microsoft-resx</value>
  </resheader>
  <resheader name="version">
    <value>2.0</value>
  </resheader>
  <resheader name="reader">
    <value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
  </resheader>
  <resheader name="writer">
    <value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
  </resheader>
</root>
'@

Set-Template 'Settings.settings' @'
<?xml version="1.0" encoding="utf-8"?>
<SettingsFile xmlns="http://schemas.microsoft.com/VisualStudio/2004/01/settings" CurrentProfile="(Default)">
  <Profiles>
    <Profile Name="(Default)" />
  </Profiles>
  <Settings />
</SettingsFile>
'@
