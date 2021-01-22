# GreenMesa
![](https://img.shields.io/github/package-json/v/enigmadigm/greenmesa)
![](https://img.shields.io/github/license/enigmadigm/greenmesa)
[![](https://img.shields.io/website?label=dashboard&url=https%3A%2F%2Fstratum.hauge.rocks%2Fdash)](https://stratum.hauge.rocks/dash)

This is the repository for a Discord bot known as GreenMesa (GM). This page acts acts as a convenient way for @GalaxySH to store core files and other stuff for the bot. 

The application ***cannot*** merely be cloned and run immediately after installation, it will fail; this app was not built for and has not been built to be able to do that smoothly. There are no installers.

Discord Server:<br/>[![AvXvvSg](https://img.shields.io/discord/745670883074637904)](https://discord.gg/AvXvvSg)

---

This bot isn't really built to run on someone else's machine (namedly you who is reading this), but mostly I'm just not going to encourage you to because, well, it's *mine*.

## Ignored files
There are *a few* ignored files (found in [.gitignore](.gitignore)) that are essential (more or less) to the bot's function, especially `auth.json`. `auth.json` contains the keys to the engine. It is a nono file for viewing, and it will stay that way. Below I provide a template so it can be at least partially reconstructed if needed. The bot should throw errors for all missing parameters that are requested.

## auth.json (config)
`auth.json` basic template in case there is need of a rebuild. May be out of date. Does not include all necessary auth properties.
```json
{
  "prefix": "[(*&%#^@$!(@*&$]",
  "ownerID": "[owner snowflake of discord app]",
  "db_config": {
      "host": "localhost",
      "user": "[user]",
      "password": "[w1eRd0_daTAba53_p@sW0Rd]",
      "database": "[stratum_database]",
      "port": "3306"
   }
}
```
Some sections of the config file will be generated if not provided (the logging parts), all parts with keys are required. There are some parts that update periodically or when commands are run, these sections are slowly moving towards being integrated in the db.

## Docker

Don't try to use the Docker files.


End.
