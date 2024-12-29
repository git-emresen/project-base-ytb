const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const config = require("../config");
const Enum = require("../config/Enum");
const Response = require("../lib/Response");
const Error = require("../lib/Error");
const RolePriviliges = require("../db/models/RolePriviliges");
const Users = require("../db/models/Users");
const UserRoles = require("../db/models/UserRoles");
const privs = require("../config/role_priviliges");
const CustomError = require("../lib/Error");
const { HTTP_CODES } = require("../config/Enum");


module.exports = function () {
  let strategy = new Strategy({
    secretOrKey: config.JWT.SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }, async (payload, done) => {
    try {
      /* console.log('JWT Payload:', payload); */
      let user = await Users.findOne({ _id: payload.id });
      if (user) {

        let userRoles = await UserRoles.find({ user_id: payload.id });
        if (!userRoles || userRoles.length === 0) {
          console.error('No roles found for user');
          return done(new Error('User roles not found'), null);
        }
        
        let rolePriviliges = await RolePriviliges.find({ role_id : { $in: userRoles.map(ur => ur.role_id) } });
        
        

        if (!rolePriviliges || rolePriviliges.length === 0) {
          console.error('No privileges found for roles');
          return done(new Error('Role privileges not found'), null);
        }

        let priviliges = rolePriviliges
          .map(rp => privs.priviliges.find(x => x.key == rp.permission))
          .filter(Boolean);

        if (priviliges.length === 0) {
          console.error('No privileges mapped');
          return done(new Error('Privileges not found'), null);
        }


        done(null, {
          id: user._id,
          roles: priviliges,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          exp: parseInt(Date.now() / 1000) * config.JWT.EXPIRE_TIME
        });
      } else {
        done(new Error("User not Found"), null);
      }
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(strategy);

  return {
    initialize: function () {
      return passport.initialize();
    },
    authenticate: function () {
      return passport.authenticate("jwt", { session: false });
    },
    checkRoles: (...expectedRoles) => {
      return (req, res, next) => {
        if (!req.user || !req.user.roles) {
          console.log('Authentication Error: req.user or req.user.roles not found');
          let response = Response.errorResponse(
            new CustomError(HTTP_CODES.UNAUTHORIZED, "Authentication Error", "User or roles not found")
          );
          return res.status(response.code).json(response);
        }

        let priviliges = req.user.roles.map(x => x.key);
        console.log('Privileges:', priviliges);

        let hasPermission = expectedRoles.some(role => priviliges.includes(role));
        if (!hasPermission) {
          console.log('Permission Denied: Missing required roles');
          let response = Response.errorResponse(
            new CustomError(HTTP_CODES.UNAUTHORIZED, "Need Permission", "Need Role Permission")
          );
          return res.status(response.code).json(response);
        }

        return next();
      };
    }
  };
};
