# Orion UI

Orion UI is a Luau library for Roblox that helps you build themed windows, tabs, panels, and utility widgets inside a game or Studio client environment.

## Project files

- `source` — the current library entry point
- `Documentation.md` — detailed API and usage notes
- `docs/` — published reference site and searchable API docs

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
- In-game Luau code editor widget
- Optional AFK detection with callbacks
- Runtime modules with lifecycle hooks
- Utility helpers for safe calls, throttling, debouncing, and signals
- Touch-aware sizing and mobile-friendly behavior

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
Editor:Blur()
```

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
