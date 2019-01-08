var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    UID: {type: String, required: true},
    name: {type: String, required: true},
    phone: String,
    email: String
});

module.exports = mongoose.model('contact', contactSchema);