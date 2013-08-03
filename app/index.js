(function (require, module) {
    'use strict';
    var util = require('util');
    var path = require('path');
    var yeoman = require('yeoman-generator');

    var StaticGenerator = module.exports = function StaticGenerator(args, options, config) {
        config = config;  // do something with config?
        yeoman.generators.Base.apply(this, arguments);

        this.on('end', function () {
            this.installDependencies({ skipInstall: options['skip-install'] });
        });

        this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    };

    util.inherits(StaticGenerator, yeoman.generators.Base);

    StaticGenerator.prototype.askFor = function askFor() {
        var callback = this.async();

        // have Yeoman greet the user.
        console.log(this.yeoman);

        var prompts = [{
            name: 'sitename',
            message: 'Enter the site title:',
            default: 'My site'
        }, {
            // set up _ template to build this SCSS config file
            name: 'gridCols',
            message: 'Number of grid columns:',
            default: 12
        }];

        this.prompt(prompts, function (props) {
            this.sitename = props.sitename;
            this.gridCols = props.gridCols;
            callback();
        }.bind(this));
    };

    StaticGenerator.prototype.gruntfile = function gruntfile() {
        this.copy('Gruntfile.js');
    };

    StaticGenerator.prototype.packageJSON = function packageJSON() {
        this.template('_package.json', 'package.json');
    };

    StaticGenerator.prototype.git = function git() {
        this.copy('gitignore', '.gitignore');
    };

    StaticGenerator.prototype.bower = function bower() {
        this.copy('bowerrc', '.bowerrc');
        this.copy('_bower.json', 'bower.json');
    };

    StaticGenerator.prototype.jshint = function jshint() {
        this.copy('jshintrc', '.jshintrc');
    };

    StaticGenerator.prototype.editorConfig = function editorConfig() {
        this.copy('editorconfig', '.editorconfig');
    };

    StaticGenerator.prototype.h5bp = function h5bp() {
        this.copy('robots.txt', 'app/robots.txt');
    };

    StaticGenerator.prototype.writeIndex = function writeIndex() {
        // can this be done with Handlebars templates?
        // prepare default content text
        var defaults = ['HTML5 Boilerplate'];
        var contentText = [
            '        <div class="container">',
            '            <div class="hero-unit">',
            '                <h1>\'Allo, \'Allo!</h1>',
            '                <p>You now have</p>',
            '                <ul>'
        ];

        this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
            'bower_components/jquery/jquery.js',
            'scripts/main.js'
        ]);

        this.indexFile = this.appendFiles({
            html: this.indexFile,
            fileType: 'js',
            optimizedPath: 'scripts/coffee.js',
            sourceFileList: ['scripts/hello.js'],
            searchPath: '.tmp'
        });

        defaults.push('RequireJS');

        // iterate over defaults and create content string
        defaults.forEach(function (el) {
            contentText.push('                    <li>' + el + '</li>');
        });

        contentText = contentText.concat([
            '                </ul>',
            '                <p>installed.</p>',
            '                <h3>Enjoy coding! - Yeoman</h3>',
            '            </div>',
            '        </div>',
            ''
        ]);

        // append the default content
        this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
    };

    StaticGenerator.prototype.requirejs = function requirejs() {
        this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
            'data-main': 'scripts/main'
        });

        // add a basic amd module
        this.write('app/scripts/app.js', [
            '/*global define */',
            'define([], function () {',
            '    \'use strict\';\n',
            '    return \'\\\'Allo \\\'Allo!\';',
            '});'
        ].join('\n'));

        this.copy('require_main.js', 'app/scripts/main.js');
    };

    StaticGenerator.prototype.app = function app() {
        this.mkdir('app');
        this.mkdir('app/scripts');
        this.mkdir('app/styles');
        this.mkdir('app/images');
        this.mkdir('app/templates');
        this.write('app/index.html', this.indexFile);
    };

}(require, module));
