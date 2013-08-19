/**
 * Build the project
 *
 * - More config options
 * - Great default start page - connect config to SASS-foundation
 *     - hero, cols, footer
 * - Typography page (partial loaded into grid)
 *
 * @param  {Global} require
 * @param  {Gloval} module
 * @return {StaticGenerator} StaticGenerator
 * not actually returned but you get the point
 */
(function (require, module) {
    'use strict';
    var util = require('util');
    var path = require('path');
    var handlebars = require('handlebars');
    var yeoman = require('yeoman-generator');

    var StaticGenerator = module.exports = function StaticGenerator(args, options, config) {
        config = config;
        yeoman.generators.Base.apply(this, arguments);

        this.templateMaps = [
            { 'name': 'indexFile', 'source': 'html/index.handlebars' },
            { 'name': 'grid', 'source': 'html/grid.handlebars' },
            { 'name': 'googleAnalytics', 'source': 'html/googleAnalytics.handlebars' },
            { 'name': 'sassConfig', 'source': 'sass/config.handlebars.sass' }
        ];
        this.templates = {};

        this.templateMaps.forEach(function (map) {
            var templatePath = path.join(this.sourceRoot(), 'handlebars/' + map.source),
                rawTemplate = this.readFileAsString(templatePath);

            this.templates[map.name] = handlebars.compile(rawTemplate);
        }.bind(this));

        handlebars.registerPartial('grid', this.templates.grid);
        handlebars.registerPartial('googleAnalytics', this.templates.googleAnalytics);

        this.on('end', function () {
            // this is how bower install and npm install are called
            this.installDependencies({ skipInstall: options['skip-install'] });
        });

        this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    };

    util.inherits(StaticGenerator, yeoman.generators.Base);

    StaticGenerator.prototype.askFor = function askFor() {
        // TODO:
        // - Hero/footer config
        // - color pallet
        // - load demo page
        var callback = this.async();

        // have Yeoman greet the user.
        console.log(this.yeoman);

        var prompts = [{
            name: 'sitename',
            message: 'Enter the site title:',
            default: 'My site'
        }, {
            // set up handlebars template to build this SCSS config file
            name: 'gridCols',
            message: 'Number of grid columns:',
            default: 12
        }, {
            // set up handlebars template to build this SCSS config file
            name: 'GAcode',
            message: 'Google Analytics code:',
            default: false
        }, {
            // set up handlebars template to build this SCSS config file
            name: 'baseFontSerif',
            message: 'Base serif font family:',
            default: 'Georgia'
        }, {
            // set up handlebars template to build this SCSS config file
            name: 'baseFontSans',
            message: 'Base sans-serif font family:',
            default: 'Helvetica'
        }];

        this.prompt(prompts, function (props) {
            this.sitename = props.sitename;
            this.gridCols = props.gridCols;
            this.GAcode = props.GAcode;
            this.baseFontSerif = props.baseFontSerif;
            this.baseFontSans = props.baseFontSans;
            callback();
        }.bind(this));
    };

    StaticGenerator.prototype.gruntfile = function gruntfile() {
        this.template('_Gruntfile.js', 'Gruntfile.js');
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
        // YES, YES IT CAN!
        //
        // 1. script array - loop through or just do the appendScripts thing
        // 2. body content
        // 3. custom script tag stuff for requirejs
        // 4. gridness
        //



        var content = '<h1>Hello World</h1>';

        this.indexFile = this.templates.indexFile({
            'gridRows': [
                {
                    'gridCols': [{'colspan': this.gridCols, 'colContent': content }]
                }
            ]
        });

        this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
            'bower_components/jquery/jquery.js',
            'scripts/main.js'
        ]);  // this does some interesting stuff - look into it, particularly for requireJS down below.

        this.indexFile = this.appendFiles({
            // this sets up usemin block - compile things for build
            html: this.indexFile,
            fileType: 'js',
            optimizedPath: 'scripts/coffee.js',
            sourceFileList: ['scripts/hello.js'],
            searchPath: '.tmp'
        });
    };

    StaticGenerator.prototype.requirejs = function requirejs() {
        this.indexFile = this.appendScripts(
            this.indexFile,
            'scripts/main.js',
            ['bower_components/requirejs/require.js'],
            { 'data-main': 'scripts/main' }
        );
        this.copy('require_main.js', 'app/scripts/main.js');
    };

    StaticGenerator.prototype.writeSassConfig = function sassConfig() {
        // handlebars useful config file to build into sass foundation
        // use default starter file or this stuff
        this.sassConfig = this.templates.sassConfig({
            'numCols': this.gridCols,
            'baseFontSerif': this.baseFontSerif,
            'baseFontSans': this.baseFontSans
        });
    };

    StaticGenerator.prototype.styles = function styles() {
        // set this up to use sass-foundation base style plus additional local style sheet,
        // concat for build - appendStyles will insert into <head>
        this.appendStyles(this.indexFile, 'styles/style.css', ['styles/style.css']);
    };
    StaticGenerator.prototype.app = function app() {
        this.mkdir('app');
        this.mkdir('app/scripts');
        this.mkdir('app/styles');
        this.mkdir('app/images');
        this.write('app/index.html', this.indexFile);
        this.write('app/styles/_config.sass', this.sassConfig);
    };

}(require, module));
