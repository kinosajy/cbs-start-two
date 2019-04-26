"use strict";

var gulp = require('gulp'),
		pug = require('gulp-pug'),
		// sass = require('gulp-sass'),
		stylus = require('gulp-stylus'),
		sourcemaps = require('gulp-sourcemaps'),
		concat = require('gulp-concat'),
		plumber = require('gulp-plumber'),
		prefix = require('gulp-autoprefixer'),
		imagemin = require('gulp-imagemin'),
		svg = require('gulp-svg-sprite'),
		svgmin = require('gulp-svgmin'),
		cheerio = require('gulp-cheerio'),
		replace = require('gulp-replace'),
		browserSync = require('browser-sync').create();

var useref = require('gulp-useref'),
		gulpif = require('gulp-if'),
		cssmin = require('gulp-clean-css'),
		uglify = require('gulp-uglify'),
		rimraf = require('rimraf'),
		notify = require('gulp-notify'),
		ftp = require('vinyl-ftp');

var paths = {
			blocks: 'blocks/',
			devDir: 'app/',
			outputDir: 'build/'
		};


/*********************************
		Developer tasks
*********************************/

//pug compile
gulp.task('pug', function() {
	return gulp.src([paths.blocks + '*.pug', '!' + paths.blocks + 'template.pug' ])
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(paths.devDir))
		.pipe(browserSync.stream())
});

//sass compile
// gulp.task('sass', function() {
// 	return gulp.src(paths.blocks + '*.sass')
// 		.pipe(plumber())
// 		.pipe(sass().on('error', sass.logError))
// 		.pipe(prefix({
// 			browsers: ['last 2 versions'],
// 			cascade: true
// 		}))
// 		.pipe(gulp.dest(paths.devDir + 'css/'))
// 		.pipe(browserSync.stream());
// });

//stylus********
gulp.task('stylus', function() {
  return gulp.src(paths.blocks + '*.styl')
  .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
  .pipe(sourcemaps.init())
  .pipe(stylus({compress: false}))
  .pipe(prefix({
    browsers: ['last 2 versions', '>1%']
  }))
  // .pipe(csso({restructure: false}))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(paths.devDir + 'css/'))
	.pipe(browserSync.stream());
});

//js compile
gulp.task('scripts', function() {
	return gulp.src([
			paths.blocks + '**/*.js',
			'!' + paths.blocks + '_assets/**/*.js'
		])
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.devDir + 'js/'))
		.pipe(browserSync.stream());
});


gulp.task('svg', function () {
	return gulp.src('app/img/svg/*.svg') 
	.pipe(svgmin({
		js2svg: {
			pretty: true
		}
	}))
	.pipe(cheerio({
		run: function ($) {
			$('[fill]').removeAttr('fill');
			$('[stroke]').removeAttr('stroke');
			$('[style]').removeAttr('style');
		},
		parserOptions: {xmlMode: true}
	}))
	.pipe(replace('&gt;', '>'))
  .pipe(svg({
		mode: {
			symbol: {
				sprite: "../sprite.svg",
			}
		}
	}))
  .pipe(gulp.dest('app/img/svg/sprite'));
});




//watch
gulp.task('watch', function() {
	gulp.watch(paths.blocks + '**/*.pug', gulp.parallel('pug'));
	// gulp.watch(paths.blocks + '**/*.sass', gulp.parallel('sass'));
	gulp.watch(paths.blocks + '**/*.styl', gulp.parallel('stylus'));
	gulp.watch(paths.blocks + '**/*.js', gulp.parallel('scripts'));
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.devDir
		}
	});
});


/*********************************
		Production tasks
*********************************/

//clean
gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});

//css + js
gulp.task('build', gulp.parallel('clean'), function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe( useref() )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
});

//copy images to outputDir
gulp.task('imgBuild', gulp.parallel('clean'), function() {
	return gulp.src(paths.devDir + 'img/**/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest(paths.outputDir + 'img/'));
});

//copy fonts to outputDir
gulp.task('fontsBuild', gulp.parallel('clean'), function() {
	return gulp.src(paths.devDir + '/fonts/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});

//ftp
gulp.task('send', function() {
	var conn = ftp.create({
		host:     '',
		user:     '',
		password: '',
		parallel: 5
	});

	/* list all files you wish to ftp in the glob variable */
	var globs = [
		'build/**/*',
		'!node_modules/**' // if you wish to exclude directories, start the item with an !
	];

	return gulp.src( globs, { base: '.', buffer: false } )
		.pipe( conn.newer( '/' ) ) // only upload newer files
		.pipe( conn.dest( '/' ) )
		.pipe(notify("Dev site updated!"));

});


//default
gulp.task('default', gulp.parallel('stylus', 'pug', 'svg', 'scripts', 'browser-sync', 'watch'));

//production
gulp.task('prod', gulp.parallel('build', 'imgBuild', 'fontsBuild'));
