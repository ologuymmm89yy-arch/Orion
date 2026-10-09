# Orion UI

Orion UI is a stronger, more polished fork of the classic Orion-style Roblox UI library. It is built for real client-side projects where window flow, mobile usability, clean controls, and predictable behavior matter more than a raw minimal prototype.

This version focuses on practical advantages:

- cleaner window lifecycle and minimize/restore flow;
- better mobile-friendly controls and UI stability;
- searchable dropdowns and more polished widgets;
- clearer compatibility rules for Roblox Studio and runtime-limited hosts;
- documentation that matches the actual code instead of a stale or mismatched version.

## Project files

- `source` — the current library entry point
- `Documentation.md` — detailed API and usage notes
- `DIFFERENCES.md` — direct comparison of this fork with the original Orion project
- `docs/` — published reference site and searchable API docs

See also [DIFFERENCES.md](DIFFERENCES.md) for a sharper comparison of this build against the upstream project, including compatibility notes for automation-style input environments and real-world client hosting constraints.

## Quick start

For Roblox Studio, create a `ModuleScript` named `Orion` in `ReplicatedStorage` and paste the contents of [`source`](source) into it. Then require it from a `LocalScript` in `StarterPlayerScripts`:

```lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local OrionLib = require(ReplicatedStorage:WaitForChild("Orion"))

local Window = OrionLib:MakeWindow({
    Name = "My project",
    Theme = "Glass",
    Language = "en",
    SaveConfig = false,
})

local Tools = Window:MakeTab({ Name = "Tools" })
Tools:AddButton({
    Name = "Run",
    Callback = function()
        print("Ready")
    end,
})
```

The `source` file is Luau for Roblox, not a web page or a standalone Lua script. It must run on the client; requiring it from a server script now reports a clear error.

### Optional HTTP loading

If your host explicitly supports both `game:HttpGet` and `loadstring`, the published source can be loaded from the raw file URL:

```lua
local OrionLib = loadstring(game:HttpGet("https://raw.githubusercontent.com/ologuymmm89yy-arch/Orion/main/source"))()
```

These functions are not available in a normal Roblox Studio `LocalScript`. Use the `ModuleScript` method above for Studio projects. The library itself does not fetch its code or external icon data at startup.

## Main features

- Window and tab layouts
- Built-in themes: `Default`, `Soft`, `Glass`, `Night`, `Aurora`
- Optional per-theme color overrides
- Search across window elements and optional filtering inside long dropdowns
- Minimize to a compact draggable title bar with restore and full-close actions
- In-game Luau code editor widget
- Optional AFK detection with callbacks
- Runtime modules with lifecycle hooks
- Utility helpers for safe calls, throttling, debouncing, and signals
- Touch-aware sizing and mobile-friendly behavior

## Full API Reference

### Window configuration

Pass a table to `OrionLib:MakeWindow(config)`. All settings are optional.

| Setting | Type | Purpose |
| --- | --- | --- |
| `Name` | string | Window title; also the default config folder name. |
| `ConfigFolder` | string | Folder used for saved configuration files. |
| `SaveConfig` | boolean | Enables config persistence when supported file APIs are available. |
| `HidePremium` | boolean | Hides the account-status area in the sidebar. |
| `SearchEnabled` | boolean | Shows the window-wide element search; enabled by default. |
| `SearchPlaceholder` | string | Placeholder for the window-wide search field. |
| `Theme` | string or table | Built-in theme name or a custom color palette. |
| `Language` | string | Built-in language: `en`, `ru`, `uk`, `pl`, `es`, or `de`. |
| `PerformanceMode` | boolean | Reduces startup and animation work; defaults on for touch devices. |
| `IntroEnabled` | boolean | Enables the intro screen; defaults off in performance mode. |
| `IntroText` | string | Intro title. |
| `IntroSubtitle` | string | Intro subtitle; localized fallback is used when omitted. |
| `IntroIcon` | string or number | Roblox asset for the intro icon. |
| `IntroDuration` | number | Intro duration, clamped to 0.5-6 seconds. Its bar is an activity animation, not measured progress. |
| `ShowIcon` | boolean | Shows a custom icon beside the window title. |
| `Icon` | string or number | Window icon asset. |
| `Background` | string, number, or table | Background asset or media settings. |
| `BackgroundImage` | string or number | Static image asset shorthand. |
| `BackgroundVideo` | string or number | Video asset shorthand. |
| `BackgroundType` | string | Media type, such as `image` or `video`. |
| `BackgroundOverlayTransparency` | number | Main-window transparency over its background. |
| `MusicId` | string or number | Optional Roblox audio asset. |
| `MusicVolume` | number | Initial audio volume. |
| `MusicLooped` | boolean | Whether the configured audio loops. |
| `AFKEnabled` | boolean | Enables inactivity monitoring; off by default. |
| `AFKTimeout` | number | Seconds without input before the AFK callback. |
| `AFKCallback` | function | Receives `(isAFK, reason)` when AFK state changes. |
| `CloseCallback` | function | Runs when the close control hides the window. |

### Widget catalog

Create controls from a tab or section. Most controls accept a `Name` and `Callback`; use the method-specific settings below.

| Method | Main settings | Returned value |
| --- | --- | --- |
| `AddButton` | `Name`, `Icon`, `Callback` | Button handle with `Set(text)`. |
| `AddToggle` | `Name`, `Default`, `Color`, `Save`, `Flag`, `Callback` | Toggle with `Value` and `Set(boolean)`. |
| `AddSlider` | `Name`, `Min`, `Max`, `Increment`, `Default`, `ValueName`, `Color`, `Save`, `Flag`, `Callback` | Slider with `Value` and `Set(number)`. |
| `AddDropdown` | `Name`, `Options`, `Default`, `Searchable`, `SearchPlaceholder`, `Save`, `Flag`, `Callback` | Dropdown with `Value`, `Set(value)`, and `Refresh(options, deleteOld)`. |
| `AddBind` | `Name`, `Default`, `Hold`, `Save`, `Flag`, `Callback` | Bind with `Value` and `Set(key)`. |
| `AddTextbox` | `Name`, `Default`, `TextDisappear`, `Callback` | Text entry; callback receives text on focus loss. |
| `AddColorpicker` | `Name`, `Default`, `Save`, `Flag`, `Callback` | Color picker with `Value` and `Set(color)`. |
| `AddLabel` | text | Label handle with `Set(text)`. |
| `AddParagraph` | title, content | Paragraph handle with `Set(content)`. |
| `AddDivider` | `Size`, `Transparency` | Divider GUI object. |
| `AddPanel` | `Text`, `Size`, `Color`, `Stroke`, `Shape`, `Callback` | Panel and optional click button; panel has `SetText(text)`. |
| `AddCircle` | `Size`, `Color`, `Stroke`, `Text`, `TextSize` | Circular GUI object. |
| `AddProgressBar` | `Name`, `Min`, `Max`, `Value`, `Color` | Progress handle with `Value` and `Set(number)`. |
| `AddMusicPlayer` | `Name`, `MusicId`, `Volume` | Shared audio `Sound` instance. |
| `AddCodeEditor` | `Text`, `ReadOnly`, `Size`, `TextSize`, `Placeholder`, `Callback` | Editor handle described below. |
| `AddCustom` | GUI object and optional properties | The parented GUI object, or `nil` for a non-GUI instance. |
| `AddSection` | `Name` | Section that exposes the same widget methods. |

`Save` and `Flag` apply to toggles, sliders, dropdowns, binds, and color pickers. A saved value needs both `Save = true` and a unique `Flag`. Config persistence depends on host file APIs.

### Searchable dropdown

Dropdown search is opt-in, so existing dropdowns keep their current layout. Matching is case-insensitive and filters the option text; `Refresh` reapplies the current query.

```lua
local Quality = Tools:AddDropdown({
    Name = "Quality",
    Options = {"Low", "Medium", "High", "Ultra"},
    Default = "High",
    Searchable = true,
    SearchPlaceholder = "Filter quality...",
    Callback = function(Value)
        print("Selected:", Value)
    end,
})

Quality:Refresh({"Low", "Medium", "High", "Ultra", "Custom"}, true)
Quality:Set("Ultra")
```

When no option matches, the component displays a localized empty state. Omit `Searchable` for the compact original dropdown.

### Window and tab methods

The returned window exposes these controls in addition to the `OrionLib` methods:

| Method | Behavior |
| --- | --- |
| `MakeTab({Name, Icon})` | Creates a tab. |
| `Search(query)` | Sets the window-wide search query. |
| `Hide()`, `Show()`, `Toggle()` | Hide, show, or invert window visibility. |
| `SetBackground(asset, isVideo)` | Sets an image or video background. |
| `SetMedia(config)` | Sets image/video background settings from a table. |
| `SetBackgroundVisible(boolean)` | Shows or hides the background media. |
| `SetMusic(asset)`, `PlayMusic()`, `PauseMusic()`, `StopMusic()` | Controls the window audio. |
| `SetMusicVolume(number)` | Sets audio volume. |
| `AddAnimation(instance, properties, duration, style, direction)` | Plays and returns a tween. |
| `Theme(name)`, `UseTheme(name)`, `SetThemeColor(theme, key, color)` | Applies a registered theme or updates a palette value. |
| `Language(code)`, `Translate(key, fallback)` | Changes UI language or translates a key. |
| `SetAFK(boolean, reason)`, `IsAFK()` | Sets or reads the AFK state. |
| `RegisterModule(name, module)`, `EnableModule(name)`, `DisableModule(name)`, `GetModule(name)` | Registers and controls optional runtime modules. |
| `Notification(config)` | Shows a notification. |
| `Destroy()` | Disconnects library events and removes its UI. |

`Window.Tab` exposes the same tab API; each tab and section exposes the widget methods from the catalog.

The minimize control collapses the window into a draggable title bar. The same control restores it; the close button on the minimized bar destroys the interface. When expanded, close hides the window and leaves the normal reopen shortcut available.

### Utility helpers

Helpers are available as `OrionLib.Utils` and `Window.Utils`.

| Helper | Behavior |
| --- | --- |
| `Clamp(value, min, max)` | Clamps a number. |
| `SafeCall(callback, ...)` | Calls a function with `pcall`; returns success and result/error. |
| `DeepCopy(value)` | Copies nested tables while handling cycles. |
| `Debounce(callback, delay)` | Delays a call until repeated calls stop. |
| `Throttle(callback, interval)` | Limits calls to at most once per interval. |
| `CreateSignal()` | Creates a local signal with `Connect`, `Fire`, and `Destroy`. |

`RegisterTheme(name, palette)`, `GetTheme(name)`, `GetThemeKeys()`, `ApplyThemePreset(name)`, `RegisterLanguage(code, dictionary)`, and `RegisterIcon(name, asset)` are available on `OrionLib`.

## Code editor and modules

The editor is a UI-only text surface. It does not execute arbitrary code and does not write Studio files.

```lua
local Editor = Window:MakeTab({ Name = "Editor" }):AddCodeEditor({
    Text = "print('Hello from Luau')",
    ReadOnly = false,
})

Editor:Focus()
print(Editor:Get())
Editor:ReplaceAll("Hello", "Ready")
print(Editor:Find("Ready"))
Editor:Blur()
```

The editor also supports `Set(text)`, `Clear()`, and `SetReadOnly(boolean)`. `Find(query)` returns matching text ranges, and `ReplaceAll(query, replacement)` returns the number of replacements. It displays text only: it does not execute code or write project files.

Optional feature packs can be registered as normal Luau tables:

```lua
Window:RegisterModule("Example", {
    Init = function(Context)
        print("Module enabled")
    end,
    Destroy = function(Context)
        print("Module disabled")
    end,
})

Window:EnableModule("Example")
```

## Compatibility note

This library targets standard Roblox client APIs. GUI parenting falls back to the local player's `PlayerGui` when a higher-level GUI parent is unavailable. Optional configuration-file persistence depends on file APIs supplied by the host; it is not available to an ordinary Studio `LocalScript`. HTTP loading also depends on host support for `game:HttpGet` and `loadstring`.

For bug reports, include the complete error output and stack trace instead of only a line number.

## Documentation

- See `Documentation.md` for the detailed API guide.
- Use the reference site in `docs/` for the searchable API overview.

## Credits

- Original Orion concept and base architecture by [shlexware](https://github.com/shlexware/Orion)
- Updated fork by [jensonhirst](https://github.com/jensonhirst/Orion)
- This build is maintained by [ologuymmm89yy-arch](https://github.com/ologuymmm89yy-arch/Orion)
