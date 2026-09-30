# Orion UI

Orion is a Luau UI library for Roblox. It provides windows, tabs, themed controls, touch-aware layouts, optional runtime modules, AFK state, and a lightweight in-game code editor.

## Project files

- `source` is the library entry point.
- `Documentation.md` contains the API guide and component examples.
- [`docs/`](docs/) is the published website and searchable API reference.

## Quick start

In an environment that supports loading the source URL:

```lua
local OrionLib = loadstring(game:HttpGet(
    "https://raw.githubusercontent.com/ologuymmm89yy-arch/Orion/main/source"
))()

local Window = OrionLib:MakeWindow({
    Name = "My project",
    Theme = "Glass",
    Language = "en",
})

local Tools = Window:MakeTab({Name = "Tools"})
Tools:AddButton({
    Name = "Run",
    Callback = function()
        print("Ready")
    end,
})
```

Use `Language` values `en`, `ru`, `uk`, `pl`, `es`, or `de`. You can also load the `source` file directly in a compatible Roblox project instead of fetching it at runtime.

## Code editor

The editor edits text inside the UI. It does not execute entered code or write Studio project files.

```lua
local Editor = Tools:AddCodeEditor({
    Text = "print('Hello')",
    ReadOnly = false,
})

Editor:Focus()
Editor:ReplaceAll("Hello", "Ready")
print(Editor:Get())
Editor:Blur()
```

`Editor:Find(query)` returns the matching text ranges. `Editor:Set(text)`, `Editor:Clear()`, and `Editor:SetReadOnly(boolean)` update the widget.

## Loading screen

The intro screen uses the selected theme, animates its entrance, and supports custom text, subtitle, and icon. It is enabled by default outside performance mode. Set `IntroDuration` between `0.5` and `6` seconds; the animated bar is an activity indicator, not a measured loading percentage.

```lua
local Window = OrionLib:MakeWindow({
    Name = "My project",
    IntroEnabled = true,
    IntroText = "My project",
    IntroSubtitle = "Preparing your interface",
    IntroDuration = 2,
})
```

## Themes and modules

Built-in themes are `Default`, `Soft`, `Glass`, `Night`, and `Aurora`. Register custom palettes with `OrionLib:RegisterTheme` and switch themes with `Window:Theme`.

Optional modules are ordinary Luau tables with `Init` and/or `Destroy` methods. Register them with `Window:RegisterModule`, then use `Window:EnableModule` and `Window:DisableModule` to control their lifecycle.

## Compatibility

The library uses Roblox APIs. Runtime loading through `loadstring` or HTTP depends on the host environment and is not available in every Roblox context. Third-party loaders may also restrict HTTP requests or GUI parents; test in the target environment and include the full error and stack trace when reporting a failure.