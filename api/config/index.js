module.exports={
    "PORT":process.env.PORT || 3000,
    "LOG_LEVEL":process.env.LOG_LEVEL || "debug",

    "CONNECTION_STRING":process.env.CONNECTION_STRING || "mongodb://127.0.0.1:27018/project_base_ytb",
    "JWT":{
        "SECRET":"12356",
        "EXPIRE_TIME":!isNaN(parseInt(process.env.TOKEN_EXPIRE_TIME)) ? parseInt(process.env.TOKEN_EXPIRE_TIME) : 24*60*60 //86400
    },
    LOGS: {
        TRANSPORT: process.env.LOG_TRANSPORT || "DB",
        LOG_LEVEL: process.env.LOG_LEVEL || "info",
        MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || "50m", // log file size
        MAX_FILES: process.env.LOG_MAX_FILES || "14d" // the number of days the logs will be stored
    },
    "DEFAULT_LANG":process.env.DEFAULT_LANG || "EN"

}   