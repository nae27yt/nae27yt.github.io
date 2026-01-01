local debugMode = false
local VERSION = "1.0.0"
local maxSlots = 10

local function DebugPrint(...)
    if debugMode then
        print("[LoadingScreen]", ...)
    end
end

local function FetchData()
    DebugPrint("Requesting static data from server")
    TriggerServerEvent('loadingscreen:requestData')
end

local function FetchMaxSlots()
    DebugPrint("Requesting max slots from server")
    TriggerServerEvent('loadingscreen:getMaxSlots')
end

RegisterNetEvent('loadingscreen:receiveMaxSlots')
AddEventHandler('loadingscreen:receiveMaxSlots', function(slots)
    DebugPrint("Received max slots from server: " .. slots)
    maxSlots = slots
    
    SendNUIMessage({
        type = "updateMaxSlots",
        maxSlots = maxSlots
    })
    
    FetchData()
end)

RegisterNetEvent('loadingscreen:receiveData')
AddEventHandler('loadingscreen:receiveData', function(data)
    DebugPrint("Received data from server: " .. json.encode(data))
    
    if data.maxPlayers and data.maxPlayers > 0 then
        maxSlots = data.maxPlayers
    end
    
    SendNUIMessage({
        type = "updateServerData",
        serverInfo = data,
        maxSlots = maxSlots
    })
end)

RegisterCommand('playsound', function()
    DebugPrint("Force play sound command received")
    SendNUIMessage({
        type = "forcePlayAudio"
    })
end, false)

RegisterNUICallback('getServerData', function(data, cb)
    DebugPrint("NUI requested server data")
    
    FetchMaxSlots()
    
    cb({
        status = "ok",
        maxSlots = maxSlots,
        defaultData = {
            serverUptime = "150 days online",
            totalActivities = "45 activities",
            availableVehicles = "250 vehicles",
            availableJobs = "25 jobs"
        }
    })
end)

RegisterNUICallback('uiReady', function(data, cb)
    DebugPrint("UI signaled ready")
    
    FetchMaxSlots()
    
    cb({status = "ok"})
end)

RegisterNUICallback('audioError', function(data, cb)
    DebugPrint("Audio error reported: " .. json.encode(data))
    
    SendNUIMessage({
        type = "forcePlayAudio"
    })
    
    cb({status = "ok"})
end)

RegisterNUICallback('audioAttempted', function(data, cb)
    DebugPrint("Audio playback attempted: " .. json.encode(data))
    cb({status = "ok"})
end)

RegisterNUICallback('audioSuccess', function(data, cb)
    DebugPrint("Audio playback succeeded")
    cb({status = "ok"})
end)

RegisterNUICallback('openLink', function(data, cb)
    if data.url then
        DebugPrint("Opening external URL: " .. data.url)
        
        -- Validate URL with a HEAD request
        PerformHttpRequest(data.url, function(errorCode, resultData, resultHeaders)
            if errorCode ~= 200 then
                DebugPrint("URL validation failed: " .. tostring(errorCode))
            end
        end, 'HEAD', '', {})
        
        -- Open URL directly with native function
        DebugPrint("Opening URL with native function")
        SwitchInFrontendMenu("FE_MENU_VERSION_MP_PAUSE", -1, -1)
        ActivateFrontendMenu(GetHashKey("FE_MENU_VERSION_MP_PAUSE"), false, -1)
        
        -- Open URL with browser
        InvokeNative(0x5C74B88D1D1C4602, data.url) -- OPEN_URL native function
    end
    
    cb({status = "ok", url = data.url})
end)

CreateThread(function()
    DebugPrint("Client started - Version " .. VERSION)
    
    Wait(1000)
    
    if GetIsLoadingScreenActive() then
        DebugPrint("Loading screen active, requesting max slots")
        FetchMaxSlots()
    end
end)

CreateThread(function()
    while GetIsLoadingScreenActive() do
        Wait(10000)
        DebugPrint("Loading screen still active, re-fetching data")
        FetchData()
    end
end)

CreateThread(function()
    RegisterCommand("openurl", function(source, args)
        if #args > 0 then
            local url = args[1]
            if not string.find(url, "^https?://") then
                url = "https://" .. url
            end
            
            DebugPrint("Opening URL from command: " .. url)
            
            if IsDuplicityVersion() then
                PerformHttpRequest(url, function() end, 'GET')
            else
                TriggerEvent("loadingscreen:openLink", url)
            end
        end
    end, false)
    
    RegisterNetEvent("loadingscreen:openLink")
    AddEventHandler("loadingscreen:openLink", function(url)
        DebugPrint("Opening URL from event: " .. url)
        
        -- Open URL directly with native function
        InvokeNative(0x5C74B88D1D1C4602, url) -- OPEN_URL native function
    end)
end)

DebugPrint("Client script initialized - Version " .. VERSION)
print("^2[LoadingScreen]^7 Client module initialized | © NaorNC - All rights reserved - Discord.gg/NCHub")