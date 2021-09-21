//Dependencies
const Chalk = require("chalk")
const Delay = require("delay")

//Main
async function self(theme, file_path, logs, callback){
    await Delay(100)

    if(file_path.indexOf(".sql") != -1){
        callback(true, `[${Chalk.rgb(theme.error.red, theme.error.green, theme.error.blue)("!")}] ${file_path} is an SQL database.`)
    }else{
        callback(false, null)
    }

    return
}

//Exporter
module.exports = {
    self: self
}