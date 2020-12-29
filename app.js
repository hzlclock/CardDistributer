var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var baseDirectory = __dirname   // or whatever base directory you want
require('log-timestamp');
io = require('socket.io');
var shell = require('shelljs');
shell.config.silent = true;

var port = 8091;

server = http.createServer(function (request, response) {
    try {
        var requestUrl = url.parse(request.url)
        console.log(request.url)
        
        var urldata = url.parse(request.url, true);
        console.log(request.method, request.connection.remoteAddress, urldata.pathname, urldata.query);

        var uri = "index.html"
            , filename = path.join(process.cwd(), uri);

        fs.exists(filename, function(exists) {
            if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
            }

            if (fs.statSync(filename).isDirectory()) filename += '/index.html';

            fs.readFile(filename, "binary", function(err, file) {
            if(err) {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
            });
        });
   } catch(e) {
        response.writeHead(500)
        response.end()     // end the response so browsers don't hang
        console.log(e.stack)
   }
}).listen(port)

console.log("listening on port "+port);

// socket.io 
var lastmsg="";
function getlatestmsg(forced=false){
    msg=shell.exec('bash search.sh search');
    if (forced==true || lastmsg!=msg){
        console.log("[Info] Forced=",forced);
        console.log(msg.stdout);
        lastmsg=msg.stdout;
        encrypted=CryptoJS.AES.encrypt(msg.stdout, privkey).toString();
        return encrypted;
    }
}
var socket = io(server); 
socket.on('connection', function(client){ 
    // new client is here! 
    client.on('message', function(){ 
        console.log('message arrive');
        // output = execSync('prince -v builds/pdf/book.html -o builds/pdf/book.pdf');
        // msg=getlatestmsg(forced=true);
        // console.log(msg);
        // client.emit("message", msg);
    });

    client.on('disconnect', function(){
        console.log('connection closed');
    });

    client.on('command', function(cmd){
        console.log(cmd)
        shell.exec('bash exec.sh '+cmd);
    });
    
});


var lastcards="";
function getlatestcards(){
    msg=shell.exec('bash exec.sh getcards');
    return msg.stdout;
}

setInterval(function(){
    cards=getlatestcards();
    if (msg!=null){
        socket.emit("cards", msg);
    }
}, 500);

setInterval(function(){
    msg=shell.exec('bash exec.sh getlog');;
    if (msg!=null){
        socket.emit("logs", msg.stdout);
    }
}, 1000);

