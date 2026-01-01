local debugMode = false
local VERSION = "1.0.0"

local function DebugPrint(...)
    if debugMode then
        print("[Project San Andreas LoadingScreen]", ...)
    end
end

local specialVehicles = {
    "Tuned Supercars", "Custom Imports", "Luxury Vehicles", "Off-Road Monsters", 
    "Drift Machines", "Racing Champions", "Classic Collectibles", "Unique Motorcycles"
}

local serverFeatures = {
    "Custom Jobs", "Property System", "Criminal Activities", "Gang System",
    "Dynamic Economy", "Realistic Weapons", "Advanced Crafting", "Racing Events"
}

local function FormatNumber(number)
    local formatted = tostring(number)
    local k
    while true do
        formatted, k = string.gsub(formatted, "^(-?%d+)(%d%d%d)", '%1,%2')
        if k == 0 then break end
    end
    return formatted
end

local staticData = {
    lastUpdate = 0,
    serverUptime = "",
    totalActivities = "",
    availableVehicles = "",
    availableJobs = "",
    maxPlayers = 0,
    specialData = {}
}

local function GenerateStaticData()
    DebugPrint("Generating new static data")
    
    local days = math.random(30, 300)
    staticData.serverUptime = days .. " days online"
    
    local activities = math.random(25, 100)
    staticData.totalActivities = FormatNumber(activities) .. " activities"
    
    local vehicles = math.random(120, 500)
    staticData.availableVehicles = FormatNumber(vehicles) .. " vehicles"
    
    local jobs = math.random(15, 45)
    staticData.availableJobs = FormatNumber(jobs) .. " jobs"
    
    staticData.maxPlayers = GetConvarInt('sv_maxclients', 64)
    
    staticData.specialData = {
        serverFeatures = serverFeatures[math.random(1, #serverFeatures)],
        specialVehicles = specialVehicles[math.random(1, #specialVehicles)],
        startUpTime = os.date("%B %Y")
    }
    
    staticData.lastUpdate = os.time()
    DebugPrint("Static data updated successfully")
end

local function GetStaticData()
    if (os.time() - staticData.lastUpdate) > 300 then
        GenerateStaticData()
    end
    
    if staticData.serverUptime == "" then
        GenerateStaticData()
    end
    
    return {
        serverUptime = staticData.serverUptime,
        totalActivities = staticData.totalActivities,
        availableVehicles = staticData.availableVehicles,
        availableJobs = staticData.availableJobs,
        maxPlayers = staticData.maxPlayers,
        specialData = staticData.specialData
    }
end

RegisterNetEvent('loadingscreen:requestData')
AddEventHandler('loadingscreen:requestData', function()
    local src = source
    DebugPrint("Received data request from client " .. src)
    
    local data = GetStaticData()
    
    DebugPrint("Sending data to client: " .. json.encode(data))
    TriggerClientEvent('loadingscreen:receiveData', src, data)
end)

CreateThread(function()
    while true do
        Wait(300000)
        GenerateStaticData()
        DebugPrint("Static data refreshed automatically")
    end
end)

RegisterNetEvent('loadingscreen:getMaxSlots')
AddEventHandler('loadingscreen:getMaxSlots', function()
    local src = source
    local maxPlayers = GetConvarInt('sv_maxclients', 64)
    DebugPrint("Sending max slots to client: " .. maxPlayers)
    TriggerClientEvent('loadingscreen:receiveMaxSlots', src, maxPlayers)
end)

GenerateStaticData()

DebugPrint("Loading screen server script initialized - Version " .. VERSION)
print("^2[LoadingScreen]^7 Server module initialized | © NaorNC - All rights reserved - Discord.gg/NCHub")