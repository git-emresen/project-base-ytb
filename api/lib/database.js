const mongoose=require('mongoose');
const Response=require('../lib/Response')

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
    let db=await mongoose.connect(options.CONNECTION_STRING)
    this.mongoConnection=db;
    console.log(`[Database connected to PORT ${db.connection.port}]`)
    }catch(err){
        let errResponse = Response.errorResponse(err);
        console.log(errResponse);
    }
}


module.exports=Database;