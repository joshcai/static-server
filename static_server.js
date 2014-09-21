var fs = require('fs');
var http = require('http');
var util = require('util');
var path = require('path');

var static = require('node-static');
var multiparty = require('multiparty');

var file = null;
// if 'uploads' directory doesn't exist, make it
fs.stat('./uploads', function(err, stats) {
  if(!stats) {
    fs.mkdirSync('./uploads');
  }
  file = new static.Server('./uploads');
});

http.createServer(function (req, res) {

    switch (req.url) {
      case '/upload':
        // display upload form
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(
          '<form action="/uploaded" enctype="multipart/form-data" method="post">'+
          '<input type="file" name="upload" multiple="multiple"><br>'+
          '<input type="submit" value="Upload">'+
          '</form>'
        );
        break;
      case '/uploaded':
        // process uploaded document
        var form = new multiparty.Form();

        form.on('file', function(name, file) {
          var target_path = path.join(__dirname, 'uploads', file.originalFilename);
          // rename file from temp location
          fs.renameSync(file.path, target_path, function(err) {
            if(err) console.error(err.stack);
          });
        });

        form.parse(req, function(err, fields, files) {
          // redirect to '/list'
          res.writeHead(301, {Location: '/list'});
          res.end();
        });
        break;
      case '/list': // list all available files on server
        var files = fs.readdirSync('./uploads');

        res.writeHead(200, {'Content-Type': 'text/html'});
        files.forEach(function(file) {
          res.write('<a href="/' + file + '">' + file + '</a><br>');
        });
        res.end();
        break;
      default:
        file.serve(req, res); // serve static file
    }

}).listen(4001);
