var path = require('path'),
    fs = require('fs'),
    sys = require('sys');

if(parseFloat(process.version.slice(1)) < 0.5){
	require.paths.unshift(path.join(__dirname, '..', 'node_module'));
}

var less = require('less');
var args = process.argv.slice(1);
var options = {
    compress: false,
    optimization: 1,
    silent: false,
    paths: []
};

args = args.filter(function (arg) {
    var match;

    if (match = arg.match(/^--?([a-z][0-9a-z-]*)(?:=([^\s]+))?$/i)) { arg = match[1] }
    else { return arg }

    switch (arg) {
        case 'v':
        case 'version':
            sys.puts("lessc " + less.version.join('.') + " (LESS Compiler) [JavaScript]");
            process.exit(0);
        case 'verbose':
            options.verbose = true;
            break;
        case 's':
        case 'silent':
            options.silent = true;
            break;
        case 'h':
        case 'help':
            sys.puts("usage: lessc source [destination]");
            process.exit(0);
        case 'x':
        case 'compress':
            options.compress = true;
            break;
        case 'include-path':
            options.paths = match[2].split(':')
                .map(function(p) {
                    if (p && p[0] == '/') {
                        return path.join(path.dirname(input), p);
                    } else if (p) {
                        return path.join(process.cwd(), p);
                    }
                });
            break;
        case 'O0': options.optimization = 0; break;
        case 'O1': options.optimization = 1; break;
        case 'O2': options.optimization = 2; break;
    }
});

var input = args[1];
if (input && input[0] != '/') {
    input = path.join(process.cwd(), input);
}
var output = args[2];
if (output && output[0] != '/') {
    output = path.join(process.cwd(), output);
}

var css, fd, tree;

if (! input) {
    sys.puts("lessc: no input files");
    process.exit(1);
}

fs.readFile(input, 'utf-8', function (e, data) {
    if (e) {
        sys.puts("lessc: " + e.message);
        process.exit(1);
    }

    new(less.Parser)({
        paths: [path.dirname(input)].concat(options.paths),
        optimization: options.optimization,
        filename: input
    }).parse(data, function (err, tree) {
        if (err) {
            less.writeError(err, options);
            process.exit(1);
        } else {
            try {
                css = tree.toCSS({ compress: options.compress });
                if (output) {
                    fd = fs.openSync(output, "w");
                    fs.writeSync(fd, css, 0, "utf8");
                } else {
                    sys.print(css);
                }
            } catch (e) {
                less.writeError(e, options);
                process.exit(2);
            }
        }
    });
});
