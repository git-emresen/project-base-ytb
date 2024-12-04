const mongoose=require('mongoose')

let instance=null;

class Database{
   constructor(){
    if(!instance){
        this.mongoConnection=null;
        instance =this;
    }
    return instance;
   }

   async connect(options){
    try{
    let db=await mongoose.connect(options.CONNECTION_STRING)
    this.mongoConnection=db;
    console.log("Db conected..!")
    }catch(eror){
    console.log("Datebase connection error..")
    }
   }
}

module.exports=Database;