//Dependencies
const Chalk = require("chalk")
const Delay = require("delay")
const Fs = require("fs")

//Main
async function self(theme, file_path, logs, callback){
    await Delay(100)

    Fs.readFile(file_path, "utf8", function(err, data){
        if(err){
            callback(false, null)
            return
        }

        const temp_discord_tokens = data.match(/mfa\.\w+|(?!B.)\w+\.\w+\.[a-z][A-Z]\w+.\w+/g)
        var discord_tokens = []

        if(temp_discord_tokens == null){
            callback(false, null)
            return
        }

        for( i in temp_discord_tokens ){
            if(temp_discord_tokens[i] != ""){
                const not_dt = temp_discord_tokens[i].match(/ |(\/(?:(?:[a-zA-Z\d\-._~\!$&'()*+,;=:@%]+(?:\/[a-zA-Z\d\-._~\!$&'()*+,;=:@%]*)*))?)/)
                
                if(discord_tokens.indexOf(temp_discord_tokens[i]) == -1 && temp_discord_tokens[i].indexOf("/") == -1 & not_dt == null){
                    discord_tokens.push(temp_discord_tokens[i])
                }
            }
        }

        if(discord_tokens.length != 0){
            callback(true, `[${Chalk.rgb(theme.error.red, theme.error.green, theme.error.blue)("!")}] Found ${discord_tokens.length} discord tokens in ${file_path}.`)
        }else{
            callback(false, null)
        }
    })

    return
}

//Exporter
module.exports = {
    self: self
}