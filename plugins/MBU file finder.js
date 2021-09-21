//Dependencies
const Chalk = require("chalk")
const Delay = require("delay")

//Main
async function self(theme, file_path, logs, callback){
    await Delay(100)

    var results = ""
    var not_empty = false

    if(file_path.indexOf(".log") != -1){
        callback(true, `[${Chalk.rgb(theme.error.red, theme.error.green, theme.error.blue)("!")}] ${file_path} is a log file.`)

        if(results.length == 0){
            results = "log"
        }else{
            results += ", log"
        }

        not_empty = true
    }

    if(file_path.indexOf("htpasswd") != -1){
        callback(true, `[${Chalk.rgb(theme.error.red, theme.error.green, theme.error.blue)("!")}] ${file_path} is an htpasswd file.`)

        if(results.length == 0){
            results = "htpasswd"
        }else{
            results += ", htpasswd"
        }

        not_empty = true
    }

    if(not_empty){
        callback(true, `[${Chalk.rgb(theme.error.red, theme.error.green, theme.error.blue)("!")}] ${file_path} is a/an ${results} file.`)
    }else{
        callback(false, null)
    }
    return
}

//Exporter
module.exports = {
    self: self
}