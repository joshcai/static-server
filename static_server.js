var fs = require('fs');
var http = require('http');
var util = require('util');
var path = require('path');

var static = require('node-static');
var multiparty = require('multiparty');

var file = new static.Server();

http.createServer(function (req, res) {

    switch (req.url) {
      case '/upload':
        display_form(req, res);
        break;
      case '/uploaded':
        var form = new multiparty.Form();

        var fileName = '';
        form.on('part', function(part){
            if(!part.filename) return;
            fileName = part.filename;
        });

        form.on('file', function(name, file){
          var target_path = path.join(__dirname, fileName);
          fs.renameSync(file.path, target_path, function(err){
            if(err) console.error(err.stack);
          });
        });

        form.parse(req, function(err, fields, files) {
          res.writeHead(301,
            {Location: '/list'}
          );
          res.end();
        });
        return;
        break;
      case '/list':
        var files = fs.readdirSync('.');
        files.splice(files.indexOf('node_modules'), 1);
        files.splice(files.indexOf('package.json'), 1);
        files.splice(files.indexOf('static_server.js'), 1);
        files.splice(files.indexOf('.git'), 1);
        files.splice(files.indexOf('.gitignore'), 1);

        var html = '';
        for(var i=0; i < files.length; i++)
        {
          html += '<a href="/' + files[i] + '">' + files[i] + '</a><br>';
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
        break;
      default:
        file.serve(req, res); // serve static file
    }

}).listen(4001);

function display_form(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(
      '<form action="/uploaded" enctype="multipart/form-data" method="post">'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    );
}
