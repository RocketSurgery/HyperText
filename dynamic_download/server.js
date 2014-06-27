/*global require, process, console*/

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require("querystring"),
    port = 8080,
    webroot = '../';

http.createServer(function (request, response) {
    'use strict';

    if (request.method === "GET") {
        var uri = webroot + url.parse(request.url).pathname,
            filename = path.join(process.cwd(), uri);

        console.log(filename);

        fs.exists(filename, function (exists) {
            if (!exists) {
                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) {
                filename += '/index.html';
            }

            fs.readFile(filename, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    response.write(err + "\n");
                    response.end();
                    return;
                }

                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            });
        });
    } else if (request.method === "POST") {
        console.log("request to POST made:");

        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function (data) {
            var post = qs.parse(body);

            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': 'attachment; filename="' + post.filename + '"'
            });
            response.write(post.content);

            response.end();
        });
    }
}).listen(port);

console.log("Static file server running at\n  => http://localhost:" + port);
