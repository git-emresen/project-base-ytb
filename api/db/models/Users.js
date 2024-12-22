let mongoose=require('mongoose')

const schema=mongoose.Schema({
    email: { type: String, required: true, required:true,unique:true },
    password: { type: String, required: true },
    is_active: { type: mongoose.Schema.Types.Boolean, defaultValue: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String },
},{
    versionKey:false,
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
})

class users extends mongoose.Model{

}
schema.loadClass(users);
module.exports=mongoose.model(users,schema)