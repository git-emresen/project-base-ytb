const bcrypt = require('bcrypt-nodejs');
const is = require('is_js');
const jwt = require('jwt-simple');

var express = require('express');
var router = express.Router();
var Users = require("../db/models/Users");
var Roles = require("../db/models/Roles");
var UserRoles = require("../db/models/UserRoles");
var CustomError = require("../lib/Error");
var Response = require("../lib/Response");
var Enum = require("../config/Enum");
const config = require('../config');
const auth = require('../lib/auth.js')();
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);

router.post('/register', async (req, res) => {
})

router.post("/auth", async (req, res) => {
  try {
    let { email, password } = req.body;
    Users.validateFieldsBeforeAuth(email, password)

    let user = await Users.findOne({ email })

    if (!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.AUTH_ERROR", req.user.language))
    if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.AUTH_ERROR", req.user.language))

    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) * config.JWT.EXPIRE_TIME
    }

    let token = jwt.encode(payload, config.JWT.SECRET)

    let userData = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    }

    res.json(Response.successResponse({ token, user: userData }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
})

router.get('/', auth.checkRoles("user_view"), async function (req, res, next) {
  try {
    let users = await Users.find();
    if (users) {
      res.json({ success: true, data: users });
    }

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }


});

router.post('/add', auth.checkRoles("user_add"), async function (req, res, next) {
  let body = req.body;
  try {
    if (!is.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.EMAIL_FORMAT_ERROR", req.user.language))
    if (!(body.password.length >= Enum.PASS_LENGTH)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.PASSWORD_LENGTH_ERROR", req.user.language, ["8"]))
    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("ROLES.ROLE_FIELDS_MUST_ARRAY", req.user.language))

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("ROLES.ROLES_NOT_FOUND", req.user.language))
    }

    let hashedPass = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let createdUser = await Users.create({
      email: body.email,
      password: hashedPass,
      is_active: body.is_active,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    })

    let newUser = await Users.findOne({ email: createdUser.email })

    for (let i = 0; i < body.roles.length; i++) {
      let newUserRole = new UserRoles({
        role_id: body.roles[i],
        user_id: newUser._id
      })
      await newUserRole.save();
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse("success:true", Enum.HTTP_CODES.CREATED));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/update", auth.checkRoles("user_update"), async (req, res) => {
  let body = req.body;

  try {
    let updates = {};
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, [_id]))
    if (!is.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.EMAIL_FORMAT_ERROR", req.user.language))
    else { updates.email = body.email }
    if (!(body.password.length >= Enum.PASS_LENGTH)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("USERS.PASSWORD_LENGTH_ERROR", req.user.language, ["8"]))
    else { updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null); }
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (!(typeof body.is_active === "boolean")) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_BOOLEAN", req.user.language, [is_active]))
    else { updates.is_active = body.is_active; }
    if (body.phone_number) updates.phone_number = body.phone_number;
  
    await Users.updateOne({_id:body._id},updates);

    let checkUserRoles=await UserRoles.find({user_id:body._id,role_id:{$in:body.roles}}); //body._id => user_id değeri
       
    
    if (Array.isArray(req.body.roles) && req.body.roles.length > 0) {
      for (let i = 0; i < body.roles.length; i++) {
        let newUserRole = new UserRoles({
          role_id: body.roles[i],
          user_id: body._id
        })
        await newUserRole.save();
      }
    }


    res.json(Response.successResponse({ success: true }));
    

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/delete', auth.checkRoles("user_delete"), async function (req, res, next) {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]))

    let result = await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({ user_id: body._id })

    if (result.acknowledged) {
      res.status(Enum.HTTP_CODES.OK).json(Response.successResponse("success:true", Enum.HTTP_CODES.OK));
    }
    else {
      res.status(Enum.HTTP_CODES.NOT_FOUND).json({ "Error": "User not found" });
    }


  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


module.exports = router;
