var autoprefixer = require('gulp-autoprefixer');
var browserSync  = require('browser-sync');
var cache        = require('gulp-cached');
var concat       = require('gulp-concat');
var config       = require('./config.json');
var cssminifiy   = require('gulp-clean-css');
var del          = require('del');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var notify       = require('gulp-notify');
var plumber      = require('gulp-plumber');
var pug          = require('gulp-pug');
var reload       = browserSync.reload;
var rename       = require('gulp-rename');
var runSequence  = require('run-sequence');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var zip          = require('gulp-zip');

// > Manage task's errors
var onError = function(err) {
	gutil.beep();
	console.log(err);
};

// > Process .PUG files into 'public' folder
gulp.task( 'templates' , function(cb) {
	return gulp.src(config.templates.src)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(cache('templatesCache'))
		.pipe(pug({
			pretty: '\t'
		}))
		.pipe(gulp.dest(config.templates.dest))
});

// > Process partials .Pug files into 'public' folder
gulp.task( 'templatePartials' , function(cb) {
	return gulp.src(config.templates.src)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(pug({
			pretty: '\t'
		}))
		.pipe(gulp.dest(config.templates.dest))
});

// > Process SASS/SCSS files to generate final css files in 'public' folder
gulp.task( 'styles' , function(cb) {
	return gulp.src(config.styles.src)
		.pipe(sourcemaps.init())
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sass({
			outputStyle: 'extended',
		}))
		.pipe(autoprefixer({
			browsers: [
				'last 2 versions',
				'ie >= 10'
			],
			cascade: false
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.styles.dest))
		.pipe(browserSync.reload({ stream:true }))
});

// > Process plugins into a single JS file inside 'assets/js' folder
gulp.task( 'plugins' , function() {
	return gulp.src(config.plugins.src)
		.pipe(sourcemaps.init())
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(concat('plugins.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.plugins.dest))
		.pipe(browserSync.reload({ stream:true }))
});

// > Process JS scripts into a single JS file inside 'assets/js' folder
gulp.task( 'scripts' , function() {
	return gulp.src(config.scripts.src)
		.pipe(sourcemaps.init())
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(concat('main.js'))
		//.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.scripts.dest))
		.pipe(browserSync.reload({ stream:true }))
});

// > Create a development server with BrowserSync
gulp.task( 'go' , ['default'], function () {
	browserSync.init({
		server : {
			baseDir: "public"
		},
		ghostMode: false,
		online: true
	});
	gulp.watch(config.watch.styles, ['styles']);
	gulp.watch(config.watch.scripts, ['scripts', 'plugins']);
	gulp.watch(config.watch.templates, ['bs-reload', ['templates']]);
	gulp.watch(config.watch.templatePartials, ['bs-reload', ['templatePartials']]);
});

// > Force a browser page reload
gulp.task( 'bs-reload' , function () {
	browserSync.reload();
});

// > Generate 'public' folder
gulp.task('default', ['clean'], function (cb) {
	runSequence('styles', ['templates', 'templatePartials', 'plugins', 'scripts'], cb);
});

// > Delete Public folder
gulp.task('clean', del.bind(null, ['public']));
