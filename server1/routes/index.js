// routes/index.js

const failMsg       = "FAIL";
const successMsg    = "SUCCESS";
const getContact    = "GET_ALL_CONTACTS";
const postContact   = "CREATE_CONTACTS";
const getImageList  = "GET_IMAGE_LIST";
const getImage      = "GET_IMAGE";
const postImage     = "CREATE_IMAGES"
const deleteImage   = "DELETE_IMAGE"
const findDelImage  = "DELETE_FIND_IMAGE"

const IMAGE_PATH    = "uploads/";

const fs            = require('fs');

// Helper function to generate logs.
function printLog(type, err) {
    var date = new Date(Date.now()).toLocaleString();
    if (!err) {
        console.log(date + " : " + type + " - " + successMsg);
    }
    else {
        console.log(date + " : " + type + " - " + failMsg);
    }
}

// Helper function to generate UID log.
function UIDLog(UID) {
    try {
        var len = UID.length;
        console.log("UID: "+UID);
    }
    catch(err) {
        console.log("UID: undefined");
    }
}

module.exports = function(app, Contact, Image)
{
    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                            Contact Handler                           //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////
    
    // GET ALL CONTACTS
    app.get('/contact/user/:UID', function(req, res) {
        Contact.find({UID: req.params.UID}, function(err, contacts) {
            UIDLog(req.params.UID);
            printLog(getContact, err);
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                res.json(contacts);
            }
        });
    });
    
    // CREATE CONTACTS
    // Pre-existing contacts SHOULD NOT be passed by POST (may produce duplicates).
    app.post('/contact', function(req, res) {
        var total_err = false;
        
        // Clear contacts database.
        /*
        mongoose.connection.db.dropCollection('contacts', function(err, result) {
            if (err) {
                console.error(err);
                total_err |= err;
            }
            else if (result != false) {
                total_err |= err;
            }
        });
        */
        Contact.deleteMany({UID: req.body.UID}, function(err) {
            if (err) {
                console.error(err);
                total_err |= err;
            }
        });
        
        UIDLog(req.body.UID);
        
        var i;
        for (i in req.body.list) {
            if (total_err)
                break;
            
            var contact = new Contact();
            contact.UID = req.body.UID;
            contact.name = req.body.list[i].name;
            contact.phone = req.body.list[i].phone;
            
            contact.save(function(err) {
                if (err) {
                    console.error(err);
                    total_err |= err;
                }
            });
        }
        
        printLog(postContact, total_err);
        
        if (total_err) {
            res.json({success: false});
        }
        else {
            res.json({success: true});
        }
    });
    
    
    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                              Image Handler                           //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////
    
    // GET A IMAGE LIST
    app.get('/image/user/:UID', function(req, res) {
        var excludeList = new Array();
        
        for (var i in req.body.list) {
            excludeList.push(req.body.list[i].id);
        }
        
        Image.find({_id: { $nin: excludeList }, UID: req.params.UID}, function(err, images) {
            UIDLog(req.params.UID);
            printLog(getImageList, err);
            
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                var includeList = new Array();
                
                for (i in images) {
                    includeList.push({id: images[i]._id});
                }
                
                res.json(includeList);
            }
        });
    });
    
    // GET A SINGLE IMAGE
    app.get('/image/:id', function(req, res) {
        Image.findById(req.params.id, function(err, image) {
            printLog(getImage, err);
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                //res.attachment(image.filePath);
                res.download(image.filePath, image.originalName);
            }
        });
    })
    
    // UPLOAD IMAGES
    /*
    app.post('/image', upload.array('image', 10), function(req, res) {
        var total_err = false;
        
        for (var i in req.files) {
            if (total_err) {
                break;
            }
            
            var image = new Image();
            image.originalName = req.files[i].originalname;
            image.contentType = req.files[i].mimetype;
            image.filePath = req.files[i].path;
            
            image.save(function(err) {
                if (err) {
                    total_err |= err;
                }
            });
        }
        
        printLog(postImage, total_err);
        if (total_err) {
            res.json({success: false});
        }
        else {
            res.json({success: true});
        }
    });
    */
    app.post('/image', function(req, res) {
        try {
            UIDLog(req.body.UID);
            for (var i in req.body.image) {
                var image = new Image();
                var uploadPath = IMAGE_PATH + String(image._id);
                
                image.UID = req.body.UID;
                image.filePath = uploadPath;
                image.save();
                
                fs.writeFile(uploadPath, new Buffer(req.body.image[i], 'base64'));
            }
            printLog(postImage, false);
            res.json({success: true});
        }
        catch(error) {
            printLog(postImage, true);
            res.json({success: false});
        }
    })
    
    
    // DELETE A IMAGE BY ID
    app.delete('/image/:id', function(req, res) {
        // Delete the file from disk.
        Image.findById(req.params.id, function(err, image) {
            printLog(findDelImage, err);
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                fs.unlink(image.filePath);
            }
        });
        // Delete the document from DB.
        Image.deleteOne({_id: req.params.id}, function(err, output) {
            printLog(deleteImage, err);
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                res.status(204).end();
            }
        });
    });

}