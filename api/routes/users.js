<<<<<<< Updated upstream
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

=======
const bycrypt = require('bcrypt-nodejs');
const is = require('is_js');
const jwt=require('jwt-simple');

var express = require('express');
var router = express.Router();
var Users = require("../db/models/Users");
var Roles=require("../db/models/Roles");
var UserRoles=require("../db/models/UserRoles");
var CustomError = require("../lib/Error");
var Response = require("../lib/Response");
var Enum = require("../config/Enum");
const config=require('../config');
const auth=require('../lib/auth.js')();


router.post('/register',async (req,res)=>{
})

router.post("/auth",async (req,res)=>{
  try{
   let {email,password}=req.body;
   Users.validateFieldsBeforeAuth(email,password)

   let user=await Users.findOne({email}) 

   if(!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED,"Validation Error","Email or Password is wrong!")
   if(!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED,"Validation Error","Email or Password is wrong!")
  
   let payload={
    id:user._id,
    exp:parseInt(Date.now()/1000)* config.JWT.EXPIRE_TIME
   }
 
   let token=jwt.encode(payload,config.JWT.SECRET)

   let userData={
    id:user._id,
    first_name:user.first_name,
    last_name:user.last_name
   }
   
   res.json(Response.sucsessResponse({token,user:userData}));
   
  }catch(err){
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.all("*",auth.authenticate(),(req,res,next)=>{
  next();
  })

router.get('/', auth.checkRoles("user_view"), async function (req, res, next) {
  try{
    let users=await Users.find();
    if(users){
     res.json({ success: true, data: users });
    }
   
  }catch(err){
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
  
  
});

router.post('/add',auth.checkRoles("user_add"), async function (req, res, next) {
  let body = req.body;
  try {
    if (!is.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Fill the email field correctly")
    if (!(body.password.length >= Enum.PASS_LENGTH)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password cant be less then 8 characters")
    if(!body.roles || !Array.isArray(body.roles)|| body.roles.length===0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!","Roles fields must be en array")
    
    let roles=await Roles.find({_id:{$in:body.roles}});

    if(roles.length==0){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!","Roles not found")
    }
    
    let hashedPass = bycrypt.hashSync(body.password, bycrypt.genSaltSync(8), null);

   let createdUser= await Users.create({
      email: body.email,
      password: hashedPass,
      is_active: body.is_active,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    })

    for(let i=0;i<body.roles.length;i++){
      await UserRoles.create({
        role_id:roles[i],
        user_id:createdUser._id
      })
    }
   

    res.status(Enum.HTTP_CODES.CREATED).json(Response.sucsessResponse("success:true", Enum.HTTP_CODES.CREATED));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/update',auth.checkRoles("user_update"), async function (req, res, next) {
  let body = req.body;
  let updates = {};
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled")

    //check the fields if they are filled correctly
    //TODO: kullanıcının var olmayan bir alana değer eklemesini engelle
    //TODO: kayıt esnasında meydana gelen hataların tümünü birlikte gönder

    if (body.password) {
      if (body.password.length >= Enum.PASS_LENGTH) {
        let hashedPass = bycrypt.hashSync(body.password, bycrypt.genSaltSync(8), null);
        updates.password = hashedPass;
      }

    }

    if (body.is_active) {
      if (typeof body.is_active === 'boolean') {
        updates.is_active = body.is_active;
      } else {
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "is_active field must be an bool value")
      }
    }
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;
    if(Array.isArray(body.roles) && body.roles>0){
      
      let userRoles=await UserRoles.find({user_id:body._id});

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id.toString()));
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.role_id).includes(x.toString()));
       
      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id) } });
    }

    // Yeni roles ekleme işlemi
    for (let i = 0; i < roles.length; i++) {
        let priv = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id
        });
        await priv.save();
    }
    }
    await Users.updateOne({ _id: body._id }, updates);

    res.status(Enum.HTTP_CODES.OK).json(Response.sucsessResponse("success:true", Enum.HTTP_CODES.OK));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/delete',auth.checkRoles("user_delete"), async function (req, res, next) {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be provided")

    let result = await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({user_id:body._id})

    if (result.acknowledged) {
      res.status(Enum.HTTP_CODES.OK).json(Response.sucsessResponse("success:true", Enum.HTTP_CODES.OK));
    }
    else {
      res.status(Enum.HTTP_CODES.NOT_FOUND).json({ "Error": "User not found" });
    }


  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


>>>>>>> Stashed changes
module.exports = router;
