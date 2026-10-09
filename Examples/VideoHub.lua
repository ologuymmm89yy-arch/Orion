local ReplicatedStorage = game:GetService("ReplicatedStorage")
local OrionLib = require(ReplicatedStorage:WaitForChild("Orion"))

local Catalog = {
	{
		Title = "Build a Better Roblox Lobby",
		Creator = "Studio Notes",
		Category = "Roblox",
		Duration = "12:48",
		Views = "18K views",
		Summary = "A practical walkthrough of lobby layout, navigation, and polish.",
	},
	{
		Title = "Luau Patterns for Small Teams",
		Creator = "Code Workshop",
		Category = "Education",
		Duration = "21:06",
		Views = "42K views",
		Summary = "Keep gameplay code readable with small modules and clear ownership.",
	},
	{
		Title = "UI Motion Without the Noise",
		Creator = "Pixel Foundry",
		Category = "Design",
		Duration = "08:32",
		Views = "9K views",
		Summary = "Use animation to clarify state changes instead of decorating every click.",
	},
}

local Preferences = {
	Autoplay = false,
	Quality = "1080p",
	Volume = 70,
}

local Window = OrionLib:MakeWindow({
	Name = "VideoHub",
	Theme = "Glass",
	Language = "en",
	SearchEnabled = true,
	PerformanceMode = true,
})

local Browse = Window:MakeTab({Name = "Explore"})
local Watch = Window:MakeTab({Name = "Watch"})
local Settings = Window:MakeTab({Name = "Settings"})

local Player = Watch:AddWidgets({
	{Type = "Section", Name = "Now playing"},
	{Type = "Paragraph", Key = "Details", Title = "Choose a video", Content = "Select an item from Explore to see its details here."},
	{Type = "Button", Key = "Preview", Name = "Play preview", Callback = function()
		OrionLib:MakeNotification({
			Name = "UI prototype",
			Content = "Connect this button to a video asset or your own playback system.",
			Time = 4,
		})
	end},
})

local VideoBlocks = {
	{Type = "Section", Name = "Featured videos"},
}

for _, Video in ipairs(Catalog) do
	local SelectedVideo = Video
	table.insert(VideoBlocks, {
		Type = "Paragraph",
		Title = SelectedVideo.Title,
		Content = SelectedVideo.Creator .. " | " .. SelectedVideo.Views .. " | " .. SelectedVideo.Duration
			.. "\n" .. SelectedVideo.Category .. " - " .. SelectedVideo.Summary,
	})
	table.insert(VideoBlocks, {
		Type = "Button",
		Name = "Open: " .. SelectedVideo.Title,
		Callback = function()
			Player.Details:Set(SelectedVideo.Title .. "\n"
				.. SelectedVideo.Creator .. " | " .. SelectedVideo.Duration .. "\n\n"
				.. SelectedVideo.Summary)
		end,
	})
end

Browse:AddWidgets(VideoBlocks)

Settings:AddWidgets({
	{Type = "Section", Name = "Playback"},
	{Type = "Toggle", Key = "Autoplay", Name = "Autoplay", Default = Preferences.Autoplay, Callback = function(Value)
		Preferences.Autoplay = Value
	end},
	{Type = "Dropdown", Key = "Quality", Name = "Quality", Options = {"720p", "1080p", "1440p"}, Default = Preferences.Quality, Callback = function(Value)
		Preferences.Quality = Value
	end},
	{Type = "Slider", Key = "Volume", Name = "Volume", Min = 0, Max = 100, Default = Preferences.Volume, Callback = function(Value)
		Preferences.Volume = Value
	end},
})
