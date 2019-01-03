// routes/index.js

module.exports = function(app, Contact)
{
    // GET ALL CONTACTS
    app.get('/contact', function(req, res) {
        Contact.find(function(err, contacts) {
            if (err) {
                console.log("GET_ALL_CONTACTS: FAIL");
                return res.status(500).send({error: 'Database failure'});
            }
            else {
                console.log("GET_ALL_CONTACTS: SUCCESS");
                res.json(contacts);
            }
        });
    });
    
    // CREATE CONTACTS
    // Pre-existing contacts SHOULD NOT be passed by POST (may produce duplicates).
    app.post('/contact', function(req, res) {
        var total_err = false;
        
        for (var i in req.body) {
            if (total_err)
                break;
            
            
            
            var contact = new Contact();
            contact.name = req.body[i].name;
            contact.phone = req.body[i].phone;
            
            contact.save(function(err) {
                if (err) {
                    console.error(err);
                    total_err = total_err | err;
                }
            });
        }
        
        if (total_err) {
            console.log("CREATE_CONTACTS: FAIL");
            res.json({success: false});
        }
        else {
            console.log("CREATE_CONTACTS: SUCCESS")
            res.json({success: true});
        }
    });

}