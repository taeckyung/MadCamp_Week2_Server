var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    originalName: String,
    contentType: String,
    filePath: String
});

module.exports = mongoose.model('image', imageSchema);