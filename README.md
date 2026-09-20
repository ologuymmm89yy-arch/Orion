# Orion UI Library

A modern Luau windowing library with a polished Orion-inspired visual style, responsive layout behavior, soft glass UI, and a cleaner theming system.

## Current status

- ✅ Core UI framework working
- ✅ Mobile-friendly sizing and touch support
- ✅ Modern theme presets: Default, Soft, Glass, Night, Aurora
- ✅ Per-theme color customization
- ✅ Glass, gradient, and shadow helpers
- ✅ Animated notification toasts
- ✅ Cleaner window-level API wrapper
- ✅ Ready for runtime testing in Roblox Studio

## Features

- Modern rounded panels and premium visual polish
- Lightweight window builder with tabs and sections
- Search box support for larger windows
- Theme switching with `Theme`, `UseTheme`, and `SetThemeColor`
- Notification API for status feedback and prompts
- Adaptive behavior for desktop and mobile layouts

## Example usage

```lua
local OrionLib = loadstring(game:HttpGet("https://raw.githubusercontent.com/ologuymmm89yy-arch/Orion/main/source"))()

local Window = OrionLib:MakeWindow({
    Name = "Orion Modern",
    Theme = "Glass",
    SaveConfig = false,
})

Window:Theme("Soft")
Window:SetThemeColor("Soft", "Main", Color3.fromRGB(245, 247, 250))
Window:Notification({
    Name = "Loaded",
    Content = "Theme updated successfully",
    Time = 4,
})
```

## Theme presets

- Default
- Soft
- Glass
- Night
- Aurora

You can also create custom themes with `RegisterTheme` or `CreateTheme` and override colors per key.

## Notes

This library is in active design polish mode and is intended for Roblox Studio validation and continued refinement. The main source file is the canonical implementation.

> Repo status: synced to the current GitHub `main` branch.

