const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");

const schema = mongoose.Schema({
    role_name: { type: String, required: true, unique:true},
    description: { type: String },
    is_active: { type: mongoose.Schema.Types.Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId },
    updated_by: { type: mongoose.Schema.Types.ObjectId }
}, {
    versionKey: false,
    timestamps: true
});

schema.index({ role_name: 1 }, { unique: true });

class Roles extends mongoose.Model {
 static async deleteOne(query){
    if(query._id){
        await RolePrivileges.deleteOne({role_id:query._id});
    }
    await super.deleteOne(query);
  }
}

schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema, "roles");