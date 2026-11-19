# Drives the scene change player with real mouse and keyboard input and saves window captures.
# Runs in Windows PowerShell 5.1 on an interactive desktop (a GitHub-hosted Windows runner).
# The player is used as built: files open through its dialog, detection runs through its
# button, and the marks on the seek bar are the ones its detection script wrote.
param(
    [Parameter(Mandatory = $true)][string]$AppDir,
    [Parameter(Mandatory = $true)][string]$Video,
    [Parameter(Mandatory = $true)][string]$OutDir,
    [int]$Threshold = 30,
    [int]$Stride = 1,
    [int]$DetectTimeoutSec = 900,
    [int]$BackdropRgb = 0xF2F2EF
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Windows.Forms, System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public static class Desk
{
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X; public int Y; }
    [StructLayout(LayoutKind.Sequential)] struct MOUSEINPUT { public int dx; public int dy; public uint mouseData; public uint dwFlags; public uint time; public IntPtr dwExtraInfo; }
    [StructLayout(LayoutKind.Sequential)] struct KEYBDINPUT { public ushort wVk; public ushort wScan; public uint dwFlags; public uint time; public IntPtr dwExtraInfo; }
    [StructLayout(LayoutKind.Explicit)] struct INPUTUNION { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
    [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public INPUTUNION u; }
    [StructLayout(LayoutKind.Sequential)] struct CURSORINFO { public int cbSize; public int flags; public IntPtr hCursor; public POINT pt; }
    [StructLayout(LayoutKind.Sequential)] struct ICONINFO { public bool fIcon; public int xHotspot; public int yHotspot; public IntPtr hbmMask; public IntPtr hbmColor; }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    struct DEVMODE
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string dmDeviceName;
        public short dmSpecVersion; public short dmDriverVersion; public short dmSize; public short dmDriverExtra;
        public int dmFields;
        public int dmPositionX; public int dmPositionY; public int dmDisplayOrientation; public int dmDisplayFixedOutput;
        public short dmColor; public short dmDuplex; public short dmYResolution; public short dmTTOption; public short dmCollate;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string dmFormName;
        public short dmLogPixels;
        public int dmBitsPerPel; public int dmPelsWidth; public int dmPelsHeight; public int dmDisplayFlags; public int dmDisplayFrequency;
        public int dmICMMethod; public int dmICMIntent; public int dmMediaType; public int dmDitherType;
        public int dmReserved1; public int dmReserved2; public int dmPanningWidth; public int dmPanningHeight;
    }

    delegate bool EnumProc(IntPtr h, IntPtr l);

    [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint n, INPUT[] inputs, int size);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr h, int attr, out RECT r, int size);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern bool GetCursorPos(out POINT p);
    [DllImport("user32.dll")] static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] static extern int GetSystemMetrics(int i);
    [DllImport("user32.dll")] static extern bool GetCursorInfo(ref CURSORINFO ci);
    [DllImport("user32.dll")] static extern bool GetIconInfo(IntPtr h, out ICONINFO ii);
    [DllImport("user32.dll")] static extern bool DrawIconEx(IntPtr hdc, int x, int y, IntPtr icon, int cx, int cy, int step, IntPtr brush, int flags);
    [DllImport("user32.dll")] static extern IntPtr LoadCursor(IntPtr inst, int id);
    [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr o);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr l);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll", CharSet = CharSet.Ansi)] static extern bool EnumDisplaySettings(string device, int mode, ref DEVMODE dm);
    [DllImport("user32.dll", CharSet = CharSet.Ansi)] static extern int ChangeDisplaySettings(ref DEVMODE dm, int flags);

    public static IntPtr BackdropHandle = IntPtr.Zero;

    public static int ScreenWidth() { return GetSystemMetrics(0); }
    public static int ScreenHeight() { return GetSystemMetrics(1); }

    public static int SetResolution(int w, int h)
    {
        DEVMODE dm = new DEVMODE();
        dm.dmSize = (short)Marshal.SizeOf(typeof(DEVMODE));
        if (!EnumDisplaySettings(null, -1, ref dm)) return -100;
        dm.dmPelsWidth = w;
        dm.dmPelsHeight = h;
        dm.dmFields = 0x80000 | 0x100000;
        return ChangeDisplaySettings(ref dm, 0);
    }

    // A plain full-screen form behind the player, so captures do not show the desktop.
    public static void StartBackdrop(int rgb)
    {
        Thread t = new Thread(new ThreadStart(delegate()
        {
            System.Windows.Forms.Form f = new System.Windows.Forms.Form();
            f.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            f.StartPosition = System.Windows.Forms.FormStartPosition.Manual;
            f.Bounds = new Rectangle(0, 0, ScreenWidth(), ScreenHeight());
            f.BackColor = Color.FromArgb(255, (rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255);
            f.ShowInTaskbar = false;
            f.Text = "capture-backdrop";
            BackdropHandle = f.Handle;
            System.Windows.Forms.Application.Run(f);
        }));
        t.SetApartmentState(ApartmentState.STA);
        t.IsBackground = true;
        t.Start();
    }

    public static string[] ListWindows(int pid)
    {
        List<string> r = new List<string>();
        EnumWindows(delegate(IntPtr h, IntPtr l)
        {
            uint p;
            GetWindowThreadProcessId(h, out p);
            if ((pid == 0 || p == (uint)pid) && IsWindowVisible(h))
            {
                StringBuilder t = new StringBuilder(512);
                GetWindowText(h, t, 512);
                StringBuilder c = new StringBuilder(256);
                GetClassName(h, c, 256);
                r.Add(h.ToInt64() + "|" + p + "|" + c + "|" + t);
            }
            return true;
        }, IntPtr.Zero);
        return r.ToArray();
    }

    public static RECT WindowRect(IntPtr h) { RECT r; GetWindowRect(h, out r); return r; }

    // The visible window frame, without the invisible resize borders.
    public static RECT Frame(IntPtr h)
    {
        RECT r;
        if (DwmGetWindowAttribute(h, 9, out r, Marshal.SizeOf(typeof(RECT))) != 0) GetWindowRect(h, out r);
        return r;
    }

    public static POINT CursorPosition() { POINT p; GetCursorPos(out p); return p; }

    static void Send(INPUT input) { INPUT[] a = new INPUT[1]; a[0] = input; SendInput(1, a, Marshal.SizeOf(typeof(INPUT))); }

    static void MouseEvent(uint flags, uint data)
    {
        INPUT i = new INPUT();
        i.type = 0;
        i.u.mi.dwFlags = flags;
        i.u.mi.mouseData = data;
        Send(i);
    }

    public static void MoveTo(int x, int y)
    {
        INPUT i = new INPUT();
        i.type = 0;
        i.u.mi.dx = (int)Math.Round(x * 65535.0 / (ScreenWidth() - 1));
        i.u.mi.dy = (int)Math.Round(y * 65535.0 / (ScreenHeight() - 1));
        i.u.mi.dwFlags = 0x0001 | 0x8000;
        Send(i);
    }

    public static void MoveExact(int x, int y)
    {
        MoveTo(x, y);
        Thread.Sleep(30);
        POINT p;
        GetCursorPos(out p);
        if (p.X != x || p.Y != y)
        {
            SetCursorPos(x, y);
            Thread.Sleep(30);
            MouseEvent(0x0001, 0);
        }
    }

    public static void Glide(int x, int y)
    {
        POINT p;
        GetCursorPos(out p);
        int steps = 14;
        for (int i = 1; i <= steps; i++)
        {
            MoveTo(p.X + (x - p.X) * i / steps, p.Y + (y - p.Y) * i / steps);
            Thread.Sleep(14);
        }
        MoveExact(x, y);
    }

    public static void Click(int x, int y)
    {
        Glide(x, y);
        Thread.Sleep(120);
        MouseEvent(0x0002, 0);
        Thread.Sleep(70);
        MouseEvent(0x0004, 0);
    }

    public static void Wheel(int delta) { MouseEvent(0x0800, unchecked((uint)delta)); }

    public static void Key(int vk, bool down)
    {
        INPUT i = new INPUT();
        i.type = 1;
        i.u.ki.wVk = (ushort)vk;
        i.u.ki.dwFlags = down ? 0u : 0x0002u;
        Send(i);
    }

    public static Bitmap Grab(int x, int y, int w, int h, bool cursor)
    {
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format24bppRgb);
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.CopyFromScreen(x, y, 0, 0, new Size(w, h), CopyPixelOperation.SourceCopy);
            if (cursor)
            {
                POINT pt;
                GetCursorPos(out pt);
                CURSORINFO ci = new CURSORINFO();
                ci.cbSize = Marshal.SizeOf(typeof(CURSORINFO));
                IntPtr hc = IntPtr.Zero;
                if (GetCursorInfo(ref ci) && ci.hCursor != IntPtr.Zero) hc = ci.hCursor;
                if (hc == IntPtr.Zero) hc = LoadCursor(IntPtr.Zero, 32512);
                int hx = 0, hy = 0;
                ICONINFO ii;
                if (GetIconInfo(hc, out ii))
                {
                    hx = ii.xHotspot;
                    hy = ii.yHotspot;
                    if (ii.hbmMask != IntPtr.Zero) DeleteObject(ii.hbmMask);
                    if (ii.hbmColor != IntPtr.Zero) DeleteObject(ii.hbmColor);
                }
                IntPtr hdc = g.GetHdc();
                DrawIconEx(hdc, pt.X - x - hx, pt.Y - y - hy, hc, 0, 0, 0, IntPtr.Zero, 0x0003);
                g.ReleaseHdc(hdc);
            }
        }
        return bmp;
    }

    public static int CursorFlags()
    {
        CURSORINFO ci = new CURSORINFO();
        ci.cbSize = Marshal.SizeOf(typeof(CURSORINFO));
        return GetCursorInfo(ref ci) ? ci.flags : -1;
    }

    // The seek bar marks are opaque rectangles filled with RGB(255, 232, 0).
    static bool IsMark(Color c) { return c.R >= 250 && c.G >= 226 && c.G <= 238 && c.B <= 12; }

    // Returns { row, start, end, start, end, ... } of the mark runs on the row that crosses them.
    public static int[] FindMarks(Bitmap bmp)
    {
        int w = bmp.Width, h = bmp.Height;
        int[] rows = new int[h];
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
                if (IsMark(bmp.GetPixel(x, y))) rows[y]++;
        int best = -1, bestCount = 0;
        for (int y = 0; y < h; y++)
            if (rows[y] > bestCount) { bestCount = rows[y]; best = y; }
        List<int> r = new List<int>();
        r.Add(best);
        if (best < 0) return r.ToArray();
        int y0 = best, y1 = best;
        while (y0 > 0 && rows[y0 - 1] > 0) y0--;
        while (y1 < h - 1 && rows[y1 + 1] > 0) y1++;
        int cy = (y0 + y1) / 2;
        r[0] = cy;
        int start = -1;
        for (int x = 0; x <= w; x++)
        {
            bool on = x < w && IsMark(bmp.GetPixel(x, cy));
            if (on && start < 0) start = x;
            if (!on && start >= 0) { r.Add(start); r.Add(x - 1); start = -1; }
        }
        return r.ToArray();
    }
}
'@

$AE = [System.Windows.Automation.AutomationElement]
$TS = [System.Windows.Automation.TreeScope]

$null = New-Item -ItemType Directory -Force -Path $OutDir
$script:LogFile = Join-Path $OutDir 'capture.log'
$script:DiagIndex = 0
$script:Started = Get-Date

function Log {
    param([string]$Message)
    $line = '{0:HH:mm:ss.fff} {1}' -f (Get-Date), $Message
    Write-Host $line
    Add-Content -Path $script:LogFile -Value $line
}

function Save-Png {
    param([int]$X, [int]$Y, [int]$W, [int]$H, [string]$Name, [bool]$Cursor = $false)
    $bmp = [Desk]::Grab($X, $Y, $W, $H, $Cursor)
    $bmp.Save((Join-Path $OutDir $Name), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Log "saved $Name (${W}x${H} at $X,$Y)"
}

function Save-Diag {
    param([string]$Name)
    $script:DiagIndex++
    $file = 'diag-{0:00}-{1}.jpg' -f $script:DiagIndex, $Name
    try {
        $bmp = [Desk]::Grab(0, 0, [Desk]::ScreenWidth(), [Desk]::ScreenHeight(), $true)
        $bmp.Save((Join-Path $OutDir $file), [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $bmp.Dispose()
        Log "diag $file"
    } catch {
        Log "diag $file failed: $($_.Exception.Message)"
    }
}

function Get-AppWindows {
    param([int]$ProcId)
    foreach ($line in [Desk]::ListWindows($ProcId)) {
        $parts = $line.Split('|', 4)
        [pscustomobject]@{ Handle = [IntPtr][long]$parts[0]; ProcId = [int]$parts[1]; Class = $parts[2]; Title = $parts[3] }
    }
}

function Find-AppWindow {
    param([int]$ProcId, [string]$Title, [string]$Class)
    foreach ($w in @(Get-AppWindows $ProcId)) {
        if ($Title -and $w.Title -ne $Title) { continue }
        if ($Class -and $w.Class -ne $Class) { continue }
        return $w
    }
    return $null
}

function Wait-AppWindow {
    param([int]$ProcId, [string]$Title, [string]$Class, [int]$TimeoutSec = 20)
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ($true) {
        $w = Find-AppWindow -ProcId $ProcId -Title $Title -Class $Class
        if ($w) { return $w }
        if ($script:Player.HasExited) { throw "the player exited (code $($script:Player.ExitCode)) while waiting for window '$Title$Class'" }
        if ((Get-Date) -gt $deadline) { throw "window '$Title$Class' did not appear within $TimeoutSec s" }
        Start-Sleep -Milliseconds 250
    }
}

function Find-ById {
    param($Root, [string]$Id, [int]$TimeoutSec = 15)
    $cond = New-Object System.Windows.Automation.PropertyCondition($AE::AutomationIdProperty, $Id)
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ($true) {
        $el = $Root.FindFirst($TS::Descendants, $cond)
        if ($el -ne $null) { return $el }
        if ((Get-Date) -gt $deadline) { throw "UI element '$Id' not found" }
        Start-Sleep -Milliseconds 250
    }
}

function Get-Center {
    param($Element)
    $r = $Element.Current.BoundingRectangle
    if ($r.IsEmpty -or [double]::IsInfinity($r.Width)) { throw "element '$($Element.Current.AutomationId)' has no screen rectangle" }
    [pscustomobject]@{ X = [int][math]::Round($r.X + $r.Width / 2); Y = [int][math]::Round($r.Y + $r.Height / 2) }
}

function Click-Element {
    param($Element)
    $c = Get-Center $Element
    [Desk]::Click($c.X, $c.Y)
}

function Set-Text {
    param($Element, [string]$Text)
    $pattern = $Element.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
    $pattern.SetValue($Text)
}

function Set-FrameRect {
    param([IntPtr]$Hwnd, [int]$X, [int]$Y, [int]$W, [int]$H)
    $wr = [Desk]::WindowRect($Hwnd)
    $fr = [Desk]::Frame($Hwnd)
    $l = $fr.Left - $wr.Left; $t = $fr.Top - $wr.Top; $r = $wr.Right - $fr.Right; $b = $wr.Bottom - $fr.Bottom
    $null = [Desk]::SetWindowPos($Hwnd, [IntPtr]::Zero, $X - $l, $Y - $t, $W + $l + $r, $H + $t + $b, 0x0014)
    Start-Sleep -Milliseconds 700
    $fr = [Desk]::Frame($Hwnd)
    Log ("frame now {0},{1} {2}x{3} (invisible borders l{4} t{5} r{6} b{7})" -f $fr.Left, $fr.Top, ($fr.Right - $fr.Left), ($fr.Bottom - $fr.Top), $l, $t, $r, $b)
}

# The player fades its controls out five seconds after the last mouse move over its window.
function Wake-Controls {
    param([IntPtr]$Hwnd)
    $f = [Desk]::Frame($Hwnd)
    $cx = [int](($f.Left + $f.Right) / 2); $cy = [int]($f.Top + ($f.Bottom - $f.Top) * 0.38)
    [Desk]::Glide($cx - 30, $cy)
    [Desk]::Glide($cx, $cy)
    Start-Sleep -Milliseconds 800
}

function Get-Marks {
    param([IntPtr]$Hwnd)
    $f = [Desk]::Frame($Hwnd)
    $top = $f.Bottom - 100
    $bmp = [Desk]::Grab($f.Left, $top, ($f.Right - $f.Left), 62, $false)
    $r = [Desk]::FindMarks($bmp)
    $bmp.Dispose()
    if ($r[0] -lt 0) { return }
    for ($i = 1; $i -lt $r.Length; $i += 2) {
        [pscustomobject]@{ X = $f.Left + [int][math]::Floor(($r[$i] + $r[$i + 1]) / 2); Y = $top + $r[0]; Width = $r[$i + 1] - $r[$i] + 1 }
    }
}

function Close-MessageBox {
    param([int]$ProcId, [string]$Why)
    $box = Find-AppWindow -ProcId $ProcId -Class '#32770'
    if (-not $box) { return $false }
    Log "message box '$($box.Title)' ($Why)"
    $el = $AE::FromHandle($box.Handle)
    $button = $el.FindFirst($TS::Descendants, (New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)))
    if ($button -ne $null) { Click-Element $button } else { [System.Windows.Forms.SendKeys]::SendWait('{ENTER}') }
    Start-Sleep -Milliseconds 600
    return $true
}

# The backdrop starts at the bottom of the window order so the player opens above it. Once the
# player is up, raise the backdrop to just below the player's lowest window to cover other windows.
function Set-BackdropBelowPlayer {
    param([int]$ProcId)
    $windows = @(Get-AppWindows $ProcId)
    if ($windows.Count) { $null = [Desk]::SetWindowPos([Desk]::BackdropHandle, $windows[-1].Handle, 0, 0, 0, 0, 0x0013) }
}

function Write-AppErrors {
    try {
        Get-WinEvent -FilterHashtable @{ LogName = 'Application'; Level = 2; StartTime = $script:Started } -MaxEvents 5 -ErrorAction Stop |
            ForEach-Object { Log ("event {0:HH:mm:ss} {1}: {2}" -f $_.TimeCreated, $_.ProviderName, $_.Message) }
    } catch {
        Log "no application error events: $($_.Exception.Message)"
    }
}

$null = [Desk]::SetProcessDPIAware()
Log "screen $([Desk]::ScreenWidth())x$([Desk]::ScreenHeight())"
if ([Desk]::ScreenWidth() -lt 1900) {
    try { Set-DisplayResolution -Width 1920 -Height 1080 -Force | Out-Null } catch { Log "Set-DisplayResolution: $($_.Exception.Message)" }
    Start-Sleep -Seconds 2
    if ([Desk]::ScreenWidth() -lt 1900) {
        Log "ChangeDisplaySettings result $([Desk]::SetResolution(1920, 1080))"
        Start-Sleep -Seconds 2
    }
    Log "screen now $([Desk]::ScreenWidth())x$([Desk]::ScreenHeight())"
}
if ([Desk]::ScreenWidth() -lt 1400) { throw "the desktop is too small for the captures" }

Save-Diag 'desktop'
foreach ($line in [Desk]::ListWindows(0)) { Log "window $line" }

[Desk]::StartBackdrop($BackdropRgb)
Start-Sleep -Seconds 2
$null = [Desk]::SetWindowPos([Desk]::BackdropHandle, [IntPtr]1, 0, 0, 0, 0, 0x0013)
Save-Diag 'backdrop'

$script:Player = $null
$failed = $false
try {
    Remove-Item (Join-Path $AppDir 'frames.ini') -ErrorAction SilentlyContinue
    $script:Player = Start-Process -FilePath (Join-Path $AppDir 'WpfApp1.exe') -WorkingDirectory $AppDir -PassThru
    $appPid = $script:Player.Id
    $mainWindow = Wait-AppWindow -ProcId $appPid -Title 'Player' -TimeoutSec 60
    $mainHwnd = $mainWindow.Handle
    Start-Sleep -Seconds 2
    $null = [Desk]::SetForegroundWindow($mainHwnd)
    $main = $AE::FromHandle($mainHwnd)
    Log "player window $mainHwnd, cursor flags $([Desk]::CursorFlags())"
    Set-BackdropBelowPlayer $appPid

    # --- Open the clip through the player's own file dialog ---------------------------------
    Set-FrameRect $mainHwnd 120 80 760 640
    Save-Diag 'launched'
    Click-Element (Find-ById $main 'OpenFileButton')
    $dialog = Wait-AppWindow -ProcId $appPid -Class '#32770' -TimeoutSec 30
    Start-Sleep -Milliseconds 1200
    $typed = $false
    try {
        $conditions = [System.Windows.Automation.Condition[]]@(
            (New-Object System.Windows.Automation.PropertyCondition($AE::AutomationIdProperty, '1148')),
            (New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, [System.Windows.Automation.ControlType]::Edit)))
        $edit = $AE::FromHandle($dialog.Handle).FindFirst($TS::Descendants, (New-Object System.Windows.Automation.AndCondition -ArgumentList (, $conditions)))
        if ($edit -ne $null) {
            $edit.SetFocus()
            Set-Text $edit $Video
            $typed = $true
        }
    } catch {
        Log "file name box: $($_.Exception.Message)"
    }
    if (-not $typed) { [System.Windows.Forms.SendKeys]::SendWait($Video) }
    Start-Sleep -Milliseconds 500
    Save-Diag 'open-dialog'
    [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
    $deadline = (Get-Date).AddSeconds(15)
    while ((Find-AppWindow -ProcId $appPid -Class '#32770') -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
    if (Find-AppWindow -ProcId $appPid -Class '#32770') { throw 'the file dialog did not close' }

    $infoButton = Find-ById $main 'OpenInfoButton'
    $deadline = (Get-Date).AddSeconds(60)
    while (-not $infoButton.Current.IsEnabled) {
        if ($script:Player.HasExited) { throw "the player exited (code $($script:Player.ExitCode)) while opening the clip" }
        if ((Get-Date) -gt $deadline) { throw 'the clip did not open within 60 s' }
        Start-Sleep -Milliseconds 250
    }
    Log 'clip opened'
    Start-Sleep -Seconds 2
    Wake-Controls $mainHwnd
    Save-Diag 'opened'

    # --- Detail panel and scene detection ---------------------------------------------------
    Click-Element $infoButton
    $detailWindow = Wait-AppWindow -ProcId $appPid -Title 'detail' -TimeoutSec 20
    $detailHwnd = $detailWindow.Handle
    $detail = $AE::FromHandle($detailHwnd)
    Start-Sleep -Milliseconds 800
    Set-Text (Find-ById $detail 'Threshold1') ([string]$Threshold)
    Set-Text (Find-ById $detail 'value') ([string]$Stride)

    $pad = 16
    $m = [Desk]::Frame($mainHwnd); $d = [Desk]::WindowRect($detailHwnd)
    $shotX = [math]::Min($m.Left, $d.Left) - $pad; $shotY = [math]::Min($m.Top, $d.Top) - $pad
    $shotW = [math]::Max($m.Right, $d.Right) + $pad - $shotX; $shotH = [math]::Max($m.Bottom, $d.Bottom) + $pad - $shotY
    Log ("main frame {0},{1}-{2},{3}; detail {4},{5}-{6},{7}" -f $m.Left, $m.Top, $m.Right, $m.Bottom, $d.Left, $d.Top, $d.Right, $d.Bottom)

    Wake-Controls $mainHwnd
    Save-Png $shotX $shotY $shotW $shotH 'detail-before-detection.png'

    $detectStarted = Get-Date
    Click-Element (Find-ById $detail 'GetFrameBtn')
    Start-Sleep -Milliseconds 600
    Wake-Controls $mainHwnd
    Save-Png $shotX $shotY $shotW $shotH 'detail-running.png'
    Save-Diag 'detecting'

    $deadline = (Get-Date).AddSeconds($DetectTimeoutSec)
    $nextNote = (Get-Date).AddSeconds(30)
    while (-not (Find-AppWindow -ProcId $appPid -Title 'Success')) {
        if ($script:Player.HasExited) { throw "the player exited (code $($script:Player.ExitCode)) during detection" }
        if ((Get-Date) -gt $deadline) { throw "detection did not finish within $DetectTimeoutSec s" }
        if ((Get-Date) -gt $nextNote) { Log ("detecting for {0:N0} s" -f ((Get-Date) - $detectStarted).TotalSeconds); $nextNote = (Get-Date).AddSeconds(30) }
        Start-Sleep -Milliseconds 500
    }
    Log ("detection finished after {0:N1} s" -f ((Get-Date) - $detectStarted).TotalSeconds)
    Start-Sleep -Milliseconds 500
    Save-Diag 'detected'
    $frames = @(Get-Content (Join-Path $AppDir 'frames.ini') | Where-Object { $_.Trim() })
    Copy-Item (Join-Path $AppDir 'frames.ini') (Join-Path $OutDir 'frames.ini')
    Log "frames.ini: $($frames.Count) frames: $($frames -join ' ')"
    $null = Close-MessageBox $appPid 'detection finished'
    if ($frames.Count -lt 2) { throw 'the detection recorded fewer than two frames' }

    # --- Detail panel captures: go to a scene by its mark, then rest the pointer on the panel ----
    Set-BackdropBelowPlayer $appPid
    Wake-Controls $mainHwnd
    $panelMarks = @(Get-Marks $mainHwnd)
    Log "marks beside the panel: $($panelMarks.Count) at x = $(($panelMarks | ForEach-Object { $_.X }) -join ' ')"
    if ($panelMarks.Count -lt 2) { throw 'no marks were found on the seek bar beside the panel' }
    $nextCenter = Get-Center (Find-ById $detail 'NextBranchBtn')
    $wanted = 12
    $picks = @()
    for ($k = 0; $k -lt $wanted; $k++) {
        $i = [int][math]::Floor(($k + 0.5) * $panelMarks.Count / $wanted)
        if ($picks -notcontains $i) { $picks += $i }
    }
    $n = 0
    foreach ($i in $picks) {
        $n++
        [Desk]::Click($panelMarks[$i].X, $panelMarks[$i].Y)
        Start-Sleep -Milliseconds 1500
        Wake-Controls $mainHwnd
        Save-Png $shotX $shotY $shotW $shotH ('detail-plain-{0:00}.png' -f $n)
        [Desk]::Glide($nextCenter.X, $nextCenter.Y)
        Start-Sleep -Milliseconds 500
        Save-Png $shotX $shotY $shotW $shotH ('detail-cand-{0:00}.png' -f $n) $true
        Log ("detail-cand-{0:00}: position mark {1}" -f $n, $i)
        if ($script:Player.HasExited) { throw "the player exited (code $($script:Player.ExitCode)) during the panel captures" }
    }
    Save-Diag 'detail-done'

    # --- Player captures: close the panel, enlarge the window, hover the marks --------------
    Wake-Controls $mainHwnd
    Click-Element $infoButton
    $deadline = (Get-Date).AddSeconds(10)
    while ((Find-AppWindow -ProcId $appPid -Title 'detail') -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
    Set-FrameRect $mainHwnd 120 80 1100 650
    Wake-Controls $mainHwnd
    $f = [Desk]::Frame($mainHwnd)
    $fw = $f.Right - $f.Left; $fh = $f.Bottom - $f.Top
    $marks = @(Get-Marks $mainHwnd)
    Log "marks on the seek bar: $($marks.Count) at x = $(($marks | ForEach-Object { $_.X }) -join ' '), y = $(if ($marks.Count) { $marks[0].Y })"
    Save-Diag 'player-marks'
    if ($marks.Count -lt 2) { throw 'no marks were found on the seek bar' }

    $wanted = 12
    $picks = @()
    for ($k = 0; $k -lt $wanted; $k++) {
        $i = [int][math]::Floor(($k + 0.5) * $marks.Count / $wanted)
        if ($picks -notcontains $i) { $picks += $i }
    }
    $n = 0
    foreach ($i in $picks) {
        $n++
        $seek = $marks[$i]
        $hover = $marks | Where-Object { $_.X -ge $seek.X + 70 } | Select-Object -First 1
        if (-not $hover) { $hover = $marks | Where-Object { $_.X -le $seek.X - 70 } | Select-Object -Last 1 }
        if (-not $hover) { $hover = $seek }
        [Desk]::Click($seek.X, $seek.Y)
        Start-Sleep -Milliseconds 1500
        [Desk]::Glide($seek.X, $seek.Y - 45)
        Start-Sleep -Milliseconds 150
        [Desk]::Glide($hover.X, $hover.Y - 45)
        [Desk]::Glide($hover.X, $hover.Y)
        Start-Sleep -Milliseconds 1100
        Save-Png $f.Left $f.Top $fw $fh ('player-cand-{0:00}.png' -f $n) $true
        Log ("player-cand-{0:00}: position mark {1} (x {2}), preview mark at x {3}" -f $n, $i, $seek.X, $hover.X)
        [Desk]::Glide($hover.X, $hover.Y - 45)
        Start-Sleep -Milliseconds 300
        if ($script:Player.HasExited) { throw "the player exited (code $($script:Player.ExitCode)) during the player captures" }
    }
    Save-Diag 'player-done'

    # --- Optional: timeline zoom with Ctrl + wheel ------------------------------------------
    try {
        $mid = $marks[[int][math]::Floor($marks.Count / 2)]
        [Desk]::Click($mid.X, $mid.Y)
        Start-Sleep -Milliseconds 1200
        [Desk]::Key(0xA2, $true)
        Start-Sleep -Milliseconds 150
        for ($w = 0; $w -lt 10; $w++) { [Desk]::Wheel(120); Start-Sleep -Milliseconds 200 }
        [Desk]::Key(0xA2, $false)
        Start-Sleep -Milliseconds 500
        [Desk]::Glide($mid.X, $mid.Y - 45)
        Start-Sleep -Milliseconds 900
        $zoomed = @(Get-Marks $mainHwnd)
        Log "marks after zoom: $($zoomed.Count) at x = $(($zoomed | ForEach-Object { $_.X }) -join ' ')"
        Save-Png $f.Left $f.Top $fw $fh 'player-zoom.png'
        Save-Diag 'zoom-done'
    } catch {
        Log "zoom captures skipped: $($_.Exception.Message)"
    } finally {
        [Desk]::Key(0xA2, $false)
    }
} catch {
    $failed = $true
    Log "FAILED: $($_.Exception.Message)"
    Log $_.ScriptStackTrace
    Save-Diag 'failure'
    foreach ($line in [Desk]::ListWindows(0)) { Log "window $line" }
    Write-AppErrors
} finally {
    if ($script:Player -and -not $script:Player.HasExited) {
        $null = $script:Player.CloseMainWindow()
        if (-not $script:Player.WaitForExit(5000)) { $script:Player.Kill() }
    }
}

if ($failed) { exit 1 }
Log 'done'
