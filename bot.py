import json
import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load config.json with error handling
config_path = "config.json"
if not os.path.exists(config_path):
    raise FileNotFoundError(f"'{config_path}' not found! Please create the file and try again.")

try:
    with open(config_path, "r") as file:
        config = json.load(file)
except json.JSONDecodeError as e:
    raise ValueError(f"Error in '{config_path}': {e}")

# Initialize the bot with no command prefix (slash commands only)
intents = discord.Intents.all()
bot = commands.Bot(command_prefix=None, intents=intents, help_command=None)  # command_prefix=None means no prefix commands

# Event: Bot is ready
@bot.event
async def on_ready():
    try:
        synced = await bot.tree.sync()  # Sync slash commands globally
        print(f"Synced {len(synced)} slash commands.")
    except Exception as e:
        print(f"Failed to sync slash commands: {e}")
    
    print(f"Logged in as {bot.user}")

    # Set bot status using the status_message from config.json
    await bot.change_presence(
        activity=discord.Activity(type=discord.ActivityType.watching, name=config["status_message"])
    )

# Function to load all cogs dynamically
async def load_cogs():
    cogs = ["cogs.fun", "cogs.general", "cogs.moderation", "cogs.owner", "cogs.bank", "cogs.rank", "cogs.rules", "cogs.roleM"]
    for cog in cogs:
        try:
            await bot.load_extension(cog)
            print(f"Loaded cog: {cog}")
        except Exception as e:
            print(f"Failed to load cog {cog}: {e}")

# Main function to start the bot
async def main():
    async with bot:
        await load_cogs()
        await bot.start(os.getenv("TOKEN"))

# Run the bot
import asyncio
asyncio.run(main())
