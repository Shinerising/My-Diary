var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var fs = require('fs');
var multer = require('multer');
var upload = multer({
    dest: 'public/uploads/'
});

/* Connect MongoDB */

mongoose.connect('mongodb://localhost/mydairy');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connected.");
});

/* Create MongoDB Schema and Model */
/* User: User Profiles */
/* Memory: Users' Dairies */

var UserSchema = new mongoose.Schema({
    name: String,
    id: String,
    password: String,
    icon: Number,
    regTime: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'UserInfo'
});
var User = mongoose.model('User', UserSchema);

var MemorySchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    content: String,
    image: String,
    owner: String,
    date: String,
    day: String,
    weather: Number,
    emotion: Number,
    pubTime: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Memories'
});
var Memory = mongoose.model('Memory', MemorySchema);

/* Add Express Middlewares */

/* Serve Static Files */
app.use(express.static(__dirname + '/public'));

/* Parse Post Requests */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/* Cookie Handle */
app.use(cookieParser());
app.use(session({
    secret: 'my dairy',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: db
    }),
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}));

/* Start server */
app.listen(8080);

/* Check if userID exists */

app.get('/exist', function(req, res) {
    User.findOne({
        id: req.query.id
    }, function(error, user) {
        var success = false;
        var message = "";
        var icon = -1;
        if (error) {
            message = error;
        }
        if (user) {
            success = true;
            icon = user.icon;
        }
        var data = {
            "action": "exist",
            "success": success,
            "message": "",
            "params": {
                "id": req.query.id,
                "icon": icon
            }
        };
        return res.json(data);
    });
});

/* Check if user has logged in by Cookie */

app.get('/islogged', function(req, res) {
    if (req.session && req.session.userid) {
        User.findOne({
            id: req.session.userid
        }, function(error, user) {
            var success = false;
            var message = "";
            var icon = -1;
            var name = "";
            var id = "";
            if (error) {
                message = error;
            }
            if (user) {
                success = true;
                icon = user.icon;
                name = user.name;
                id = user.id;
            } else {
                message = "Session error!";
            }
            var data = {
                "action": "islogged",
                "success": success,
                "message": message,
                "params": {
                    "name": name,
                    "id": id,
                    "icon": icon
                }
            };
            return res.json(data);
        });
    } else {
        var data = {
            "action": "islogged",
            "success": false,
            "message": "",
            "params": {
                "id": ""
            }
        };
        return res.json(data);
    }
});

/* Sign up new user profile */

app.post('/signup', function(req, res) {
    User.findOne({
        id: req.body.id
    }, function(error, user) {
        var success = false;
        var message = "";
        var data = {};
        if (error) {
            message = error;
            data = {
                "action": "signup",
                "success": success,
                "message": message,
                "params": {
                    "name": req.body.name,
                    "id": req.body.id,
                    "icon": req.body.icon
                }
            };
            return res.json(data);
        } else if (user) {
            message = "User ID has been used!";
            data = {
                "action": "signup",
                "success": success,
                "message": message,
                "params": {
                    "name": req.body.name,
                    "id": req.body.id,
                    "icon": req.body.icon
                }
            };
            return res.json(data);
        } else {
            var newUser = new User({
                name: req.body.name,
                id: req.body.id,
                password: req.body.password,
                icon: req.body.icon
            });
            newUser.save(function(error) {
                if (error) {
                    console.log(error);
                    message = error;
                } else {
                    success = true;
                    req.session.userid = req.body.id;
                }
                data = {
                    "action": "signup",
                    "success": success,
                    "message": message,
                    "params": {
                        "name": req.body.name,
                        "id": req.body.id,
                        "icon": req.body.icon
                    }
                };
                return res.json(data);
            });
        }
    });
});

/* User log in */

app.post('/login', function(req, res) {
    User.findOne({
        id: req.body.id,
        password: req.body.password
    }, function(error, user) {
        var success = false;
        var message = "";
        var icon = -1;
        var name = "";
        var id = "";
        if (error) {
            message = error;
        }
        if (user) {
            success = true;
            icon = user.icon;
            name = user.name;
            id = user.id;
            req.session.userid = req.body.id;
        } else {
            message = "ID or Password error!";
        }
        var data = {
            "action": "login",
            "success": success,
            "message": message,
            "params": {
                "name": name,
                "id": id,
                "icon": icon
            }
        };
        return res.json(data);
    });
});

/* User log out */

app.get('/logout', function(req, res) {
    req.session.destroy();
    console.log('deleted sesstion');
    var data = {
        "action": "logout",
        "success": true,
        "message": "",
        "params": {}
    };
    return res.json(data);
});

/* Get all dairies of user */

app.post('/pages', function(req, res) {
    if (req.session && req.session.userid) {
        Memory.find({
            owner: req.session.userid
        }, function(error, pages) {
            var success = false;
            var message = "";
            if (error) {
                message = error;
            } else {
                success = true;
            }
            var data = {
                "action": "pages",
                "success": success,
                "message": message,
                "params": {
                    "pages": pages
                }
            };
            return res.json(data);
        });
    } else {
        var data = {
            "action": "pages",
            "success": false,
            "message": "You don't log in!",
            "params": {}
        };
        return res.json(data);
    }
});

/* Add a new diary */

app.post('/addnew', function(req, res) {
    if (req.session && req.session.userid) {
        var newMemory = new Memory({
            title: req.body.title,
            subtitle: req.body.subtitle,
            content: req.body.content,
            image: req.body.image,
            owner: req.session.userid,
            date: req.body.date,
            day: req.body.day,
            weather: req.body.weather,
            emotion: req.body.emotion,
        });
        newMemory.save(function(error) {
            var success = false;
            var message = "";
            var _id = newMemory._id;
            var data = {};
            if (error) {
                console.log(error);
                message = error;
            } else {
                success = true;
            }
            data = {
                "action": "addnew",
                "success": success,
                "message": message,
                "params": {
                    "_id": _id
                }
            };
            return res.json(data);
        });
    } else {
        var data = {
            "action": "addnew",
            "success": false,
            "message": "You don't log in!",
            "params": {
                "id": ""
            }
        };
        return res.json(data);
    }
});

/* Update a existed diary */

app.post('/update', function(req, res) {
    if (req.session && req.session.userid) {
        var update = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            content: req.body.content,
            image: req.body.image,
            date: req.body.date,
            day: req.body.day,
            weather: req.body.weather,
            emotion: req.body.emotion,
        };
        var options = {
            new: true
        };
        Memory.findOneAndUpdate({
            _id: req.body._id
        }, update, options, function(error, memory) {
            var success = false;
            var message = "";
            if (error) {
                message = error;
            }
            if (memory) {
                success = true;
            } else {
                message = "Original Memory Lost!";
            }
            var data = {
                "action": "update",
                "success": success,
                "message": message,
                "params": {
                    "_id": memory._id
                }
            };
            return res.json(data);
        });
    } else {
        var data = {
            "action": "update",
            "success": false,
            "message": "You don't log in!",
            "params": {
                "_id": req.body._id
            }
        };
        return res.json(data);
    }
});

/* Delete a existed diary */

app.post('/delete', function(req, res) {
    if (req.session && req.session.userid) {
        Memory.findOneAndRemove({
            _id: req.body._id,
            owner: req.session.userid
        }, function(error, memory) {
            var success = false;
            var message = "";
            if (error) {
                message = error;
            }
            if (memory) {
                success = true;
            } else {
                message = "Original Memory Lost!";
            }
            var data = {
                "action": "delete",
                "success": success,
                "message": message,
                "params": {
                    "_id": req.body._id
                }
            };
            return res.json(data);
        });
    } else {
        var data = {
            "action": "delete",
            "success": false,
            "message": "You don't log in!",
            "params": {
                "_id": req.body._id
            }
        };
        return res.json(data);
    }
});

/* Upload a image */

app.post('/image-upload', upload.single('imageFile'), function(req, res) {
    res.send("uploads/" + req.file.filename);
});