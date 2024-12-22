const mongoose = require("mongoose");

const schema = mongoose.Schema({
    level: { type: String, required: true },
    email: { type: String },
    location: { type: String, required: true },
    proc_type: { type: String, required: true },
    log: { type: mongoose.SchemaTypes.Mixed }
}, {
    versionKey: false,
    timestamps: true
});

class AuditLogs extends mongoose.Model {

}

schema.loadClass(AuditLogs);
module.exports = mongoose.model("auditlogs", schema, "auditlogs");