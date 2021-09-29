//Dependencies
const ReadLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
})
const CLI_Spinners = require("cli-spinners")
const Chalk = require("chalk")
const Delay = require("delay")
const Path = require("path")
// const Ora = require("ora")
const Fs = require("fs")

//Variables
const Theme = require("./settings/theme.json")
const Plugins = Fs.readdirSync("./plugins", "utf8")

var MrHello = {}
MrHello.target_directory = ""
MrHello.scan_log_output = ""
MrHello.blacklisted_paths = []

//Functions
function directory_files(dir, done) {
    var results = []

    Fs.readdir(dir, function (err, list) {
        if (err) return done(err)

        var list_length = list.length

        if (!list_length) return done(null, results)

        list.forEach(function (file) {
            file = Path.resolve(dir, file)

            Fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    directory_files(file, function (err, res) {
                        results = results.concat(res)

                        if (!--list_length) done(null, results)
                    })
                } else {
                    var is_blacklisted = false

                    for( i in MrHello.blacklisted_paths ){
                        if(MrHello.blacklisted_paths[i] != ""){
                            if(file.indexOf(MrHello.blacklisted_paths[i]) != -1){
                                is_blacklisted = true
                            }
                        }
                    }

                    if(!is_blacklisted){
                        results.push(file)
                    }
                    
                    if (!--list_length) done(null, results)
                }
            })
        })
    })
}

MrHello.navigation = function(){
    ReadLine.question(`${Chalk.rgb(Theme.navigate_name.red, Theme.navigate_name.green, Theme.navigate_name.blue)("mrhello")} {>} `, command =>{
        const command_args = command.split(" ")

        if(command == "help"){
            console.log(`
    Command             Description
    ┉┉┉┉┉┉┉             ┉┉┉┉┉┉┉┉┉┉┉
    help                Help menu
    conf                Display your configuration
    SET SCAN_LOG_OUTPUT Logs your scan then save the output on the path that you specified then empty the variable
    SET DIRECTORY       The directory files to scan
    SET BLACKLIST_PATH The path's to blacklist.
    clear               Clear the console
    start               Start the scanning
    exit                Exit MrHello
    `)

            MrHello.navigation()
            return
        }else if(command == "conf"){
            console.log(`
    Variable             Value
    ┉┉┉┉┉┉┉┉             ┉┉┉┉┉
    SET DIRECTORY        ${( MrHello.target_directory == "" ? "None" : MrHello.target_directory)}
    SET SCAN_LOG_OUTPUT  ${( MrHello.scan_log_output == "" ? "None" : MrHello.scan_log_output)}
    SET BLACKLIST_PATH   ${( MrHello.blacklisted_paths == "" ? "None" : MrHello.blacklisted_paths)}
    `)
            MrHello.navigation()
            return
        }else if(command_args[0] == "SET" && command_args[1] == "DIRECTORY"){
            if(command_args[2] == "" || command_args[2] == null){
                console.log(`Usage: SET DIRECTORY <directory_path>
Example: SET DIRECTORY test`)
                MrHello.navigation()
                return
            }

            if(!Fs.existsSync(command_args[2])){
                console.log(`[${Chalk.rgb(Theme.error.red, Theme.error.green, Theme.error.blue)("!")}] The directory path that you specified is incorrect.`)
                MrHello.navigation()
                return
            }

            MrHello.target_directory = command_args[2]
            console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] SET DIRECTORY > ${command_args[2]}`)
            MrHello.navigation()
            return
        }else if(command_args[0] == "SET" && command_args[1] == "SCAN_LOG_OUTPUT"){
            if(command_args[2] == "" || command_args[2] == null){
                console.log(`Usage: SET SCAN_LOG_OUTPUT <output_path>
Example: SET SCAN_LOG_OUTPUT test/output_test.txt`)
                MrHello.navigation()
                return
            }

            if(command_args[2].indexOf(".") == -1){
                console.log(`[${Chalk.rgb(Theme.error.red, Theme.error.green, Theme.error.blue)("!")}] The output path that you specified is incorrect.`)
                MrHello.navigation()
                return
            }

            MrHello.scan_log_output = command_args[2]
            console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] SET SCAN_LOG_OUTPUT > ${command_args[2]}`)
            MrHello.navigation()
            return
        }else if(command_args[0] == "SET" && command_args[1] == "BLACKLIST_PATH"){
            if(command_args[2] == "ADD"){
                if(command_args[3] == "" || command_args[3] == null){
                    console.log(`Usage: SET BLACKLIST_PATH <paths>
Example: SET BLACKLIST_PATH ADD \\test
Example 2: SET BLACKLIST_PATH CLEAR`)
                    MrHello.navigation()
                    return
                }

                MrHello.blacklisted_paths.push(command_args[3])
                console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] SET BLACKLISTED_PATHS > ${MrHello.blacklisted_paths}`)
                MrHello.navigation()
            }else if(command_args[2] == "CLEAR"){
                MrHello.blacklisted_paths = []
                console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] SET BLACKLISTED_PATHS > []`)
                MrHello.navigation()
            }else{
                console.log(`[${Chalk.rgb(Theme.error.red, Theme.error.green, Theme.error.blue)("!")}] Invalid ADD/CLEAR option.`)
                MrHello.navigation()
            }

            return
        }else if(command == "start"){
            if(MrHello.target_directory == ""){
                console.log(`[${Chalk.rgb(Theme.error.red, Theme.error.green, Theme.error.blue)("!")}] SET DIRECTORY variable is empty.`)
                MrHello.navigation()
                return
            }

            if(MrHello.scan_log_output == ""){
                console.log(`[${Chalk.rgb(Theme.warning.red, Theme.warning.green, Theme.warning.blue)("!")}] SET SCAN_LOG_OUTPUT variable is empty.`)
            }

            directory_files(MrHello.target_directory, function(err, results){
                if(err){
                    MrHello.navigation()
                    return
                }

                if(results.length == 0){
                    console.log(`[${Chalk.rgb(Theme.error.red, Theme.error.green, Theme.error.blue)("!")}] No files found in the directory, please use another directory.`)
                    MrHello.navigation()
                    return
                }

                var max = results.length * Plugins.length

                var u_l_i_found = 0
                var logs = ""

                console.log("Scanner is starting...")
                
                setTimeout(function(){
                    console.log("Scanner had started, please wait because this might take a while.")

                    for( i in results ){
                        if(results[i] != ""){
                            for( i2 in Plugins ){
                                if(Plugins[i2] != ""){
                                    require(`./Plugins/${Plugins[i2]}`).self(Theme, results[i], logs, function(success, result){
                                        max -= 1

                                        if(success){
                                            u_l_i_found += 1
                                        }
 
                                        if(result != null){
                                            if(logs.length == 0){
                                                logs = result
                                            }else{
                                                logs += `\n${result}`
                                            }
                                        }

                                        if(max == 0){
                                            if(u_l_i_found < 50){
                                                console.log(logs)
                                            }
                                            
                                            const slo_handler = new Promise((resolve, reject)=>{
                                                if(MrHello.scan_log_output != ""){
                                                    logs = logs.replace(/.*?]./g, "")
                                                    
                                                    console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] Looks like the SET SCAN_LOG_OUTPUT variable is not empty.`)
                                                    console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] Saving the logs please wait.`)

                                                    Fs.writeFile(MrHello.scan_log_output, logs, "utf8", function(err){
                                                        if(err){
                                                            console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] Unable to save the logs.`)
                                                            console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] Emptying the variable.`)
                                                            MrHello.scan_log_output = ""

                                                            resolve()
                                                            return
                                                        }

                                                        console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] Logs successfully saved.`)
                                                        console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] Emptying the variable.`)
                                                        MrHello.scan_log_output = ""

                                                        resolve()
                                                    })
                                                }else{
                                                    resolve()
                                                }
                                            })

                                            slo_handler.then(()=>{
                                                if(u_l_i_found != 0){
                                                    console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] ${u_l_i_found} leaks/useful information found.`)
                                                }else{
                                                    console.log(`[${Chalk.rgb(Theme.info.red, Theme.info.green, Theme.info.blue)("!")}] No leaks/useful information found.`)
                                                }
    
                                                setTimeout(function(){
                                                    MrHello.navigation()
                                                }, 3000)
                                            })

                                            return
                                        }
                                    })
                                }else{
                                    max -= 1
                                }
                            }
                        }else{
                            max -= 1
                        }
                    }
                }, 2000)
            })
        }else if(command == "clear"){
            console.clear()
            MrHello.navigation()
            return
        }else if(command == "exit"){
            console.clear()
            process.exit()
        }else{
            console.log(`[${Chalk.rgb(Theme.error.red, Theme.error.green, Theme.error.blue)("!")}] Unknown command.`)
            MrHello.navigation()
            return
        }
    })
}

//Main
console.log(Chalk.rgb(Theme.banner.red, Theme.banner.green, Theme.banner.blue)(`
███╗   ███╗██████╗ ██╗  ██╗███████╗██╗     ██╗      ██████╗ 
████╗ ████║██╔══██╗██║  ██║██╔════╝██║     ██║     ██╔═══██╗
██╔████╔██║██████╔╝███████║█████╗  ██║     ██║     ██║   ██║
██║╚██╔╝██║██╔══██╗██╔══██║██╔══╝  ██║     ██║     ██║   ██║
██║ ╚═╝ ██║██║  ██║██║  ██║███████╗███████╗███████╗╚██████╔╝
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ `))
console.log(Chalk.rgb(Theme.information.red, Theme.information.green, Theme.information.blue)(`―――――─━[ Developed by Psych0 ]━─―――――
――――─━[    MrHello v1.0.0     ]━─――――
―――─━[    ${Plugins.length} plugins loaded     ]━─―――`))

console.log("")
MrHello.navigation()
