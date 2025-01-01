const bcrypt=require('bcrypt-nodejs')  
const is=require('is_js')
const mongoose=require('mongoose');
const { PASS_LENGTH, HTTP_CODES } = require('../../config/Enum');
const CustomError = require('../../lib/Error');
const { DEFAULT_LANG } = require('../../config');

const schema=mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_active: { type: mongoose.Schema.Types.Boolean, defaultValue: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String },
    language:{type:String,default:DEFAULT_LANG}
},{
    timestamps:{
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
})

class Users extends mongoose.Model{

  validPassword(password){
    return bcrypt.compareSync(password,this.password);
 }

 static validateFieldsBeforeAuth(email,password){
    if(typeof password !== 'string'|| password.length<PASS_LENGTH||is.not.email(email))
        throw new CustomError(HTTP_CODES.UNAUTHORIZED,"Validation Error","Email or Password Wrong")
    return null
 }
}
schema.loadClass(Users);
module.exports=mongoose.model("users",schema)
