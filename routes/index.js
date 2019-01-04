// routes/index.js

const failMsg       = "FAIL";
const successMsg    = "SUCCESS";
const getContact    = "GET_ALL_CONTACTS";
const postContact   = "CREATE_CONTACTS";
const getImage      = "GET_IMAGES";
const getSingleImage= "GET_ONE_IMAGE";
const postImage     = "CREATE_IMAGE"
const deleteImage   = "DELETE_IMAGE"
const deleteFindImage="DELETE_FIND_IMAGE"

const IMAGE_PATH    = "uploads/";

const fs            = require('fs');
//const zip           = require('express-zip');
const multer        = require('multer');
const upload        = multer({dest: IMAGE_PATH});

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

module.exports = function(app, mongoose, Contact, Image)
{
    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                            Contact Handler                           //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////
    
    // GET ALL CONTACTS
    app.get('/contact', function(req, res) {
        Contact.find(function(err, contacts) {
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
        mongoose.connection.db.dropCollection('contacts', function(err, result) {
            if (err) {
                console.error(err);
                total_err |= err;
            }
            else if (result != false) {
                total_err |= err;
            }
        });
        
        var i;
        for (i in req.body.list) {
            if (total_err)
                break;
            
            var contact = new Contact();
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
    app.get('/image', function(req, res) {
        var i;
        var excludeList = new Array();
        
        for (i in req.body.list) {
            excludeList.push(req.body.list[i].id);
        }
        
        Image.find({_id: { $nin: excludeList }}, function(err, images) {
            printLog(getImage, err);
            
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                var includeList = new Array();
                
                for (i in images) {
                    includeList.push({id: images[i]._id});
                }
                
                res.json({"list": includeList});
            }
        });
    });
    
    // GET A SINGLE IMAGE
    app.get('/image/:id', function(req, res) {
        Image.findById(req.params.id, function(err, image) {
            printLog(getSingleImage, err);
            if (err) {
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                //res.attachment(image.filePath);
                res.download(image.filePath, image.originalName);
            }
        });
    })
    
    // UPLOAD A IMAGE
    app.post('/image', upload.single('image'), function(req, res) {
        var image = new Image();
        image.originalName = req.file.originalname;
        image.contentType = req.file.mimetype;
        image.filePath = req.file.path;
        
        image.save(function(err) {
            printLog(postImage, err);
            if (err) {
                res.json({success: false});
            }
            else {
                res.json({success: true});
            }
        });
    });
    
    
    // DELETE A IMAGE BY ID
    app.delete('/image/:id', function(req, res) {
        // Delete the file from disk.
        Image.findById(req.params.id, function(err, image) {
            printLog(deleteFindImage, err);
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