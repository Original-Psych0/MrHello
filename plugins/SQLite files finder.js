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

        if(data.indexOf("SQLite format") != -1){
            callback(true, `[${Chalk.rgb(theme.error.red, theme.error.green, theme.error.blue)("!")}] ${file_path} is an SQLite database.`)
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