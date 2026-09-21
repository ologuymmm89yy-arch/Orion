# Orion UI Library

> **Temporary compatibility notice:** the library is currently under runtime repair. It may fail during startup in some protected loaders or environments with restricted HTTP, GUI, or `loadstring` support. Roblox Studio validation is the reference environment.

A modern Luau windowing library with a polished Orion-inspired visual style, responsive layout behavior, soft glass UI, and a cleaner theming system.

## Current status

- ✅ Core UI framework working
- ✅ Mobile-friendly sizing and touch support
- ✅ Modern theme presets: Default, Soft, Glass, Night, Aurora
- ✅ Per-theme color customization
- ✅ Glass, gradient, and shadow helpers
- ✅ Animated notification toasts
- ✅ Cleaner window-level API wrapper
- ✅ Built-in icon fallbacks without startup HTTP dependency
- ⚠️ Runtime compatibility with third-party loaders is not guaranteed yet

## Features

- Modern rounded panels and premium visual polish
- Lightweight window builder with tabs and sections
- Search box support for larger windows
- Theme switching with `Theme`, `UseTheme`, and `SetThemeColor`
- Built-in localization for English, Russian, Ukrainian, Polish, Spanish, and German
- Notification API for status feedback and prompts
- Built-in icon mappings with `RegisterIcon` for custom assets
- Optional AFK detection with timeout, recovery, and callback support
- Lightweight Luau code editor widget with line numbers
- Safe optional module registry for feature packs
- General scripting utilities: `SafeCall`, `Debounce`, `Throttle`, `DeepCopy`, and signals
- Adaptive behavior for desktop and mobile layouts

## Example usage

```lua
local OrionLib = loadstring(game:HttpGet("https://raw.githubusercontent.com/ologuymmm89yy-arch/Orion/main/source"))()

local Window = OrionLib:MakeWindow({
    Name = "Orion Modern",
    Theme = "Glass",
    Language = "ru",
    SaveConfig = false,
})

Window:Theme("Soft")
Window:SetThemeColor("Soft", "Main", Color3.fromRGB(245, 247, 250))
Window:Notification({
    Name = "Loaded",
    Content = "Theme updated successfully",
    Time = 4,
})

Window:ConfigureAFK({
    Enabled = true,
    Timeout = 300,
    Callback = function(IsAFK, Reason)
        print("AFK state:", IsAFK, Reason)
    end,
})

local Editor = Window:MakeTab({Name = "Tools"}):AddCodeEditor({
    Text = "print('Hello from Luau')",
    Size = UDim2.new(1, 0, 0, 220),
})

print(Editor:Get())
print(#Editor:Find("print"))
Editor:ReplaceAll("Hello", "Welcome")
```

Available language codes: `en`, `ru`, `uk`, `pl`, `es`, `de`.

You can switch language later with `OrionLib:SetLanguage("uk")` or `Window:Language("pl")`. Custom dictionaries can be registered with `RegisterLanguage`.

Optional modules can be registered as ordinary Luau tables:

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

Modules are lifecycle helpers, not file installers. Roblox runtime code cannot write Studio files or install plugins by itself.

The library also exposes original scripting helpers through `OrionLib.Utils` or `Window.Utils`:

```lua
local SafeCall = OrionLib.Utils.SafeCall
local Debounced = OrionLib.Utils.Debounce(function(Value)
    print(Value)
end, 0.2)

Debounced("ready")
```

## Theme presets

- Default
- Soft
- Glass
- Night
- Aurora

You can also create custom themes with `RegisterTheme` or `CreateTheme` and override colors per key.

## Compatibility status

The source is being stabilized for two broad environments:

- standard Roblox Studio / supported client execution;
- environments that expose compatible GUI and HTTP APIs.

Protected loaders may report errors on different line numbers because they wrap or transform the script before execution. A loader can also block `HttpService`, `game:HttpGetAsync`, `CoreGui`, or `loadstring`. Those restrictions are outside the library and can prevent startup even when the source is valid.

For debugging, capture the complete error text and its stack trace. Do not rely on a line number alone.

> Repo status: synced to the current GitHub `main` branch.

## Validation

The source passes the available static diagnostics. Runtime verification should be performed in Roblox Studio on desktop and mobile.

