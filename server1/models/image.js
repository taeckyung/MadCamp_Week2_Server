var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    UID: {type: String, required: true},
    filePath: {type: String, required: true}
});

module.exports = mongoose.model('image', imageSchema);