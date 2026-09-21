# Orion Library

This documentation describes the current development build of Orion Library.

> **Temporary compatibility notice:** the library is not yet guaranteed to start in every third-party or protected loader. Some environments modify the script, block HTTP requests, restrict GUI parents, or expose incomplete Roblox APIs. Test first in Roblox Studio or a compatible client environment.

## Current limitation

The library is currently being stabilized after a large UI, theme, localization, and performance update. In unsupported loaders it may fail before `MakeWindow` is called. A reported line such as `2`, `5`, or `6` can belong to the loader wrapper rather than the library source, so always copy the full error message and stack trace when reporting a problem.

The most common external causes are:

- blocked `loadstring` or HTTP access;
- restricted `HttpService` or `game:HttpGetAsync`;
- unavailable `CoreGui`, `gethui`, or `PlayerGui` access;
- missing or incompatible Roblox UI APIs;
- a loader rewriting the source and changing line numbers.

The library does not include executor-specific protection or bypass code. Compatibility is intentionally limited to standard Roblox APIs and environments that expose compatible equivalents.

## Code editor and optional modules

The library includes a lightweight in-game Luau editor widget. It is intended for displaying or editing code inside a Roblox UI; it does not execute arbitrary text and does not write Studio files.

```lua
local Tools = Window:MakeTab({Name = "Tools"})
local Editor = Tools:AddCodeEditor({
	Text = "print('Hello from Luau')",
	ReadOnly = false,
})

Editor:Set("local Ready = true")
print(Editor:Get())
Editor:Clear()
```

Feature packs can be registered as normal Luau modules with guarded lifecycle methods:

```lua
Window:RegisterModule("Profiler", {
	Init = function(Context)
		print("Profiler enabled")
	end,
	Destroy = function(Context)
		print("Profiler disabled")
	end,
})

Window:EnableModule("Profiler")
Window:DisableModule("Profiler")
```

These modules are runtime extensions. Installing Studio plugins or writing files requires a separate Roblox Studio Plugin and cannot be performed by a normal in-game UI library.

## Icons without remote dependencies

The library no longer downloads an external icon package during startup. Core icons use built-in Roblox asset mappings, so a blocked HTTP request does not prevent the UI from being created.

Register your own icon mapping when needed:

```lua
OrionLib:RegisterIcon("settings", "rbxassetid://1234567890")

local Tab = Window:MakeTab({
	Name = "Settings",
	Icon = "settings",
})
```

Custom asset IDs and image URLs passed directly to `Icon`, `Image`, or notification configuration continue to work when the current environment permits those assets.

## Booting the Library
```lua
local OrionLib = loadstring(game:HttpGet("https://raw.githubusercontent.com/ologuymmm89yy-arch/Orion/main/source"))()
```

## Creating a Window
```lua
local Window = OrionLib:MakeWindow({
	Name = "Title of the library",
	HidePremium = false,
	SaveConfig = true,
	ConfigFolder = "OrionTest",
	Language = "ru",
})

--[[
Name = <string> - The name of the UI.
HidePremium = <bool> - Whether or not the user details shows Premium status or not.
SaveConfig = <bool> - Toggles the config saving in the UI.
ConfigFolder = <string> - The name of the folder where the configs are saved.
SearchEnabled = <bool> - Shows the built-in element search field. Enabled by default.
Theme = <string|table> - Uses a registered theme name or a custom theme table for this window.
PerformanceMode = <bool> - Reduces animation and startup work for low-end devices. Enabled by default on touch devices.
IntroEnabled = <bool> - Whether or not to show the intro animation.
IntroText = <string> - Text to show in the intro animation.
IntroIcon = <string> - URL to the image you want to use in the intro animation.
Icon = <string> - URL to the image you want displayed on the window.
CloseCallback = <function> - Function to execute when the window is closed.
BackgroundImage = <number|string> - Optional static background asset ID.
BackgroundVideo = <number|string> - Optional looping video asset ID for an animated background.
BackgroundTransparency = <number> - Image transparency for a static background.
MusicId = <number|string> - Optional Roblox audio asset ID to play when the window starts.
MusicVolume = <number> - Initial music volume from 0 to 10.
MusicLooped = <bool> - Whether configured music should loop.
Language = <string> - Built-in language code: en, ru, uk, pl, es, or de.
AFKEnabled = <bool> - Enables optional inactivity detection. Disabled by default.
AFKTimeout = <number> - Seconds without input before AFK state, minimum 10.
AFKCallback = <function> - Called with (isAFK, reason) when the state changes.
]]
```

### AFK support

AFK detection is opt-in and uses standard Roblox input signals. It marks the user as AFK after the configured timeout, returns to active on input, and also listens for `LocalPlayer.Idled` when available.

```lua
local Window = OrionLib:MakeWindow({
	Name = "AFK-aware UI",
	AFKEnabled = true,
	AFKTimeout = 300,
	AFKCallback = function(IsAFK, Reason)
		print(IsAFK and "User is AFK" or "User is active", Reason)
	end,
})

Window:SetAFK(false, "manual")
print(Window:IsAFK())
```

### Media and animations
```lua
local Window = OrionLib:MakeWindow({
	Name = "Media UI",
	BackgroundVideo = 1234567890,
	MusicId = 9876543210,
	MusicVolume = 0.25
})

Window:SetMusic(9876543210)
Window:PlayMusic()
Window:SetMusicVolume(0.4)
Window:PauseMusic()
Window:StopMusic()

Window:SetBackground(1234567890, true)
Window:SetBackgroundVisible(false)

Window:AddAnimation(Frame, {BackgroundTransparency = 0.2}, 0.4)
```

To place a compact player with `Play`, `Pause`, and `Stop` buttons inside a tab:
```lua
local Music = Tab:AddMusicPlayer({
	Name = "Menu soundtrack",
	MusicId = 9876543210,
	Volume = 0.25
})
```

`BackgroundVideo` requires a Roblox video asset that the current experience can play. Audio and video permissions are controlled by Roblox; restricted assets will not play. Use `BackgroundImage` for a static image.

### Compatibility and cleanup

The library waits for `Players.LocalPlayer` before creating the interface. It tries GUI parents in this order: `gethui` when provided by the environment, `CoreGui`, and finally the player's `PlayerGui`. This keeps the same script usable in supported client environments without requiring executor-specific protection APIs.

Call `Window:Destroy()` when the interface is no longer needed. It immediately disconnects registered input events, stops owning UI updates, and destroys the library GUI.

### Managing configurations
```lua
OrionLib:SaveConfig("combat")
OrionLib:LoadConfig("combat")
```

Saved values must use `Save = true` and a `Flag`.

### Themes
```lua
OrionLib:RegisterTheme("Ocean", {
	Main = Color3.fromRGB(18, 24, 32),
	Second = Color3.fromRGB(27, 38, 51),
	Stroke = Color3.fromRGB(70, 100, 130),
	Divider = Color3.fromRGB(55, 75, 95),
	Text = Color3.fromRGB(235, 245, 255),
	TextDark = Color3.fromRGB(150, 175, 195)
})
OrionLib:SetTheme("Ocean")
```

### Mobile support
The window automatically adapts to touch screens and stays within the available viewport. Buttons, dragging, sliders, color pickers, and keybind assignment support touch input. On mobile, selecting a keybind opens an on-screen keyboard with common navigation and control keys. When the window is hidden on a mobile device, use the `Open Orion` button to show it again.



## Creating a Tab
```lua
local Tab = Window:MakeTab({
	Name = "Tab 1",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

--[[
Name = <string> - The name of the tab.
Icon = <string> - The icon of the tab.
PremiumOnly = <bool> - Makes the tab accessible to Sirus Premium users only.
]]
```
## Creating a Section
```lua
local Section = Tab:AddSection({
	Name = "Section"
})

--[[
Name = <string> - The name of the section.
]]
```
You can add elements to sections the same way you would add them to a tab normally.

## Custom GUI elements
```lua
local Badge = Tab:AddCircle({
	Size = UDim2.new(0, 48, 0, 48),
	Color = Color3.fromRGB(40, 120, 220),
	Text = "!",
	TextSize = 18
})

local Panel = Instance.new("Frame")
Tab:AddCustom(Panel, {
	Size = UDim2.new(1, 0, 0, 80),
	BackgroundColor3 = Color3.fromRGB(30, 30, 30)
})
```

`AddCircle` creates a themed circular component. `AddCustom` accepts any Roblox `GuiObject`, so custom panels and controls can be added without changing the library internals.

```lua
local Card, CardButton = Tab:AddPanel({
	Shape = "Rounded", -- Use "Circle" for a circular panel.
	Size = UDim2.new(1, 0, 0, 64),
	CornerRadius = 12,
	Text = "Open settings",
	Callback = function()
		print("Card pressed")
	end
})

Card:SetText("Settings")
```

`AddPanel` supports `Shape`, `CornerRadius`, `Transparency`, `Stroke`, `Thickness`, `Text`, and `Callback`.

For low-end devices, keep the default `PerformanceMode` or enable it explicitly:
```lua
local Window = OrionLib:MakeWindow({
	Name = "Fast UI",
	PerformanceMode = true
})
```

### Progress and layout helpers
```lua
Tab:AddDivider()

local Loading = Tab:AddProgressBar({
	Name = "Loading",
	Min = 0,
	Max = 100,
	Value = 25,
	Color = Color3.fromRGB(60, 140, 230)
})

Loading:Set(75)
```

## Notifying the user
```lua
OrionLib:MakeNotification({
	Name = "Title!",
	Content = "Notification content... what will it say??",
	Image = "rbxassetid://4483345998",
	Time = 5
})

--[[
Title = <string> - The title of the notification.
Content = <string> - The content of the notification.
Image = <string> - The icon of the notification.
Time = <number> - The duration of the notfication.
]]
```



## Creating a Button
```lua
Tab:AddButton({
	Name = "Button!",
	Callback = function()
      		print("button pressed")
  	end    
})

--[[
Name = <string> - The name of the button.
Callback = <function> - The function of the button.
]]
```


## Creating a Checkbox toggle
```lua
Tab:AddToggle({
	Name = "This is a toggle!",
	Default = false,
	Callback = function(Value)
		print(Value)
	end    
})

--[[
Name = <string> - The name of the toggle.
Default = <bool> - The default value of the toggle.
Callback = <function> - The function of the toggle.
]]
```

### Changing the value of an existing Toggle
```lua
CoolToggle:Set(true)
```



## Creating a Color Picker
```lua
Tab:AddColorpicker({
	Name = "Colorpicker",
	Default = Color3.fromRGB(255, 0, 0),
	Callback = function(Value)
		print(Value)
	end	  
})

--[[
Name = <string> - The name of the colorpicker.
Default = <color3> - The default value of the colorpicker.
Callback = <function> - The function of the colorpicker.
]]
```

### Setting the color picker's value
```lua
ColorPicker:Set(Color3.fromRGB(255,255,255))
```


## Creating a Slider
```lua
Tab:AddSlider({
	Name = "Slider",
	Min = 0,
	Max = 20,
	Default = 5,
	Color = Color3.fromRGB(255,255,255),
	Increment = 1,
	ValueName = "bananas",
	Callback = function(Value)
		print(Value)
	end    
})

--[[
Name = <string> - The name of the slider.
Min = <number> - The minimal value of the slider.
Max = <number> - The maxium value of the slider.
Increment = <number> - How much the slider will change value when dragging.
Default = <number> - The default value of the slider.
ValueName = <string> - The text after the value number.
Callback = <function> - The function of the slider.
]]
```

### Change Slider Value
```lua
Slider:Set(2)
```
Make sure you make your slider a variable (local CoolSlider = Tab:AddSlider...) for this to work.


## Creating a Label
```lua
Tab:AddLabel("Label")
```

### Changing the value of an existing label
```lua
CoolLabel:Set("Label New!")
```


## Creating a Paragraph
```lua
Tab:AddParagraph("Paragraph","Paragraph Content")
```

### Changing an existing paragraph
```lua
CoolParagraph:Set("Paragraph New!", "New Paragraph Content!")
```


## Creating an Adaptive Input
```lua
Tab:AddTextbox({
	Name = "Textbox",
	Default = "default box input",
	TextDisappear = true,
	Callback = function(Value)
		print(Value)
	end	  
})

--[[
Name = <string> - The name of the textbox.
Default = <string> - The default value of the textbox.
TextDisappear = <bool> - Makes the text disappear in the textbox after losing focus.
Callback = <function> - The function of the textbox.
]]
```


## Creating a Keybind
```lua
Tab:AddBind({
	Name = "Bind",
	Default = Enum.KeyCode.E,
	Hold = false,
	Callback = function()
		print("press")
	end    
})

--[[
Name = <string> - The name of the bind.
Default = <keycode> - The default value of the bind.
Hold = <bool> - Makes the bind work like: Holding the key > The bind returns true, Not holding the key > Bind returns false.
Callback = <function> - The function of the bind.
]]
```

### Chaning the value of a bind
```lua
Bind:Set(Enum.KeyCode.E)
```


## Creating a Dropdown menu
```lua
Tab:AddDropdown({
	Name = "Dropdown",
	Default = "1",
	Options = {"1", "2"},
	Callback = function(Value)
		print(Value)
	end    
})

--[[
Name = <string> - The name of the dropdown.
Default = <string> - The default value of the dropdown.
Options = <table> - The options in the dropdown.
Callback = <function> - The function of the dropdown.
]]
```

### Adding a set of new Dropdown buttons to an existing menu
```lua
Dropdown:Refresh(List<table>,true)
```

The above boolean value "true" is whether or not the current buttons will be deleted.
### Selecting a dropdown option
```lua
Dropdown:Set("dropdown option")
```

# Finishing your script (REQUIRED)
The below function needs to be added at the end of your code.
```lua
OrionLib:Init()
```

### How flags work.
The flags feature in the ui may be confusing for some people. It serves the purpose of being the ID of an element in the config file, and makes accessing the value of an element anywhere in the code possible.
Below in an example of using flags.
```lua
Tab1:AddToggle({
    Name = "Toggle",
    Default = true,
    Save = true,
    Flag = "toggle"
})

print(OrionLib.Flags["toggle"].Value) -- prints the value of the toggle.
```
Flags only work with the toggle, slider, dropdown, bind, and colorpicker.

### Making your interface work with configs.
In order to make your interface use the configs function you first need to add the `SaveConfig` and `ConfigFolder` arguments to your window function. The explanation of these arguments in above.
Then you need to add the `Flag` and `Save` values to every toggle, slider, dropdown, bind, and colorpicker you want to include in the config file.
The `Flag = <string>` argument is the ID of an element in the config file.
The `Save = <bool>` argument includes the element in the config file.
Config files are made for every game the library is launched in.

## Destroying the Interface
```lua
OrionLib:Destroy()
```
