
var express = require("express");
var fs = require("fs");
var crypto = require("crypto");

function simpleHash(str, seed = 0){
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function randomSalt(){
    return simpleHash(toString(Date.now()), Date.now());
}

function SHA256(str){
    const H = crypto.createHash("sha256");
    return H.update(str).digest("hex");
}

var app = express();

app.set("view engine", "ejs");

var package = JSON.parse(fs.readFileSync("package.json", "utf8"));

app.use(express.static("css"));
app.use(express.static("client"));
app.use('/images', express.static("images"));
app.use('/audio', express.static("audio"));

app.get("/index", function(req, res) {
    res.render("index", {gameVersion: package.version});
});

app.get("/changelog", function(req, res) {
    res.render("changelog");
});

app.get("/login", function(req, res) {
    let type = req.query.type;
    let formType = null;
    if(type == "login") formType = `
    <form method="get" action="/form" id="mainForm">
        <div class="optionContainer2">
            <input name="username" autocomplete="username"> <div class= "optionText">Username</div>
        </div>
        <div class="optionContainer2">
            <input name="password" type="password" autocomplete="current-password"> <div class= "optionText">Password</div>
        </div>
        <div class="optionContainer2">
            <input type="radio" name="overwrite" value="yes"> Yes
            <input type="radio" name="overwrite" value="no" checked> No
            <div class= "optionText">Overwrite save</div>
        </div>
        <button>Submit</button>
    </form>
    <div id="loginInfo">
    </div>
    `;
    else if(type == "signup") formType = `
    <form method="get" action="/form" id="mainForm">
        <div class="optionContainer2">
            <input name="username" autocomplete="username"> <div class= "optionText">Username</div>
        </div>
        <div class="optionContainer2">
            <input name="password" type="password" autocomplete="current-password"> <div class= "optionText">Password</div>
        </div>
        <div class="optionContainer2">
            <input name="passwordConfirm" type="password" autocomplete="current-password"> <div class= "optionText">Confirm password</div>
        </div>
        <button>Submit</button>
    </form>
    <div id="loginInfo">
    </div>
    `;
    res.render("login", {formType: formType});
});

app.get("/form", function(req, res) {
    let accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    let response = null;
    emptyFields = 0;
    for(const [key, value] of Object.entries(req.query)){
        if(value == ""){
            emptyFields = 1;
            break;
        }
    }
    if(emptyFields == 0){
        if(req.query.type == "login"){
            let ok = 0;
            let user = null;
            let index = 0;
            for(user0 of accounts){
                if(user0.username == req.query.username){
                    ok = 1;
                    user = user0;
                    break;
                }
                index++;
            }
            if(ok == 0){
                response = "User doesn't exist.";
            }
            else{
                hashedPassword = SHA256(simpleHash(req.query.password + user.passwordSalt).toString());
                if(hashedPassword != user.passwordHash){
                    response = "Wrong password.";
                }
                else{
                    if(req.query.overwrite == "yes"){
                        accounts[index].save = req.query.save;
                    }
                    let authToken = SHA256(user.username + randomSalt());
                    accounts[index].auth = authToken;
                    fs.writeFileSync("accounts.json", JSON.stringify(accounts));
                    response = JSON.stringify({ok: "ok", auth: authToken});
                }
            }
        }
        else if(req.query.type == "signup"){
            let ok = 0;
            for(user of accounts){
                if(user.username == req.query.username){
                    ok = 1;
                    break;
                }
            }
            if(ok == 1){
                response = "Username taken.";
            }
            else{
                let doubleHashedPassword = SHA256(req.query.passwordHash.toString());
                accounts.push({username: req.query.username, passwordHash: doubleHashedPassword, passwordSalt: req.query.passwordSalt, save: req.query.save});
                fs.writeFileSync("accounts.json", JSON.stringify(accounts));
                response = "ok";
            }
        }
    }
    else{
        response = "All fields must be filled in!";
    }
    res.send({res: response});
});

app.get("/auth", function(req, res) {
    let auth = req.query.auth;
    let accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    for(user of accounts){
        if(user.auth == auth){
            res.send({res: user.save});
            return;
        }
    }
    res.send({res: "none"});
});

app.get("/save", function(req, res) {
    let auth = req.query.auth;
    let save = req.query.save;

    let accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    let index = 0;
    for(user of accounts){
        if(user.auth == auth){
            accounts[index].save = save;
            fs.writeFileSync("accounts.json", JSON.stringify(accounts));
            res.send({res: "ok"});
            return;
        }
        index++;
    }
    res.send({res: "none"});
});

app.get("/logout", function(req, res) {
    let auth = req.query.auth;

    let accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    let index = 0;
    for(user of accounts){
        if(user.auth == auth){
            delete accounts[index]["auth"];
            fs.writeFileSync("accounts.json", JSON.stringify(accounts));
            res.send({res: "ok"});
            return;
        }
        index++;
    }
    res.send({res: "none"});
});

app.get("/", function(req, res) {
    res.redirect("/index");
});

app.get('*', function(req, res){
    res.status(404).render("404");
  });

app.listen(5000, function() {
    console.log("Server started.");
});