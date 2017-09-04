var gulp = require('gulp'),
    minify = require('gulp-minify'),
    cleanCSS = require('gulp-clean-css'),
    jsonminify = require('gulp-jsonminify'),
    webserver = require('gulp-webserver');

gulp.task('js', function () {
	return gulp.src('assets/src/*.js')
		.pipe(minify({
			ext: {
				min: '.min.js'
			},
			noSource: true
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
	return gulp.src(['assets/src/*.css'])
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('json', function () {
	return gulp.src('assets/src/gallery_info.json')
		.pipe(jsonminify())
		.pipe(gulp.dest('dist'))
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

gulp.task("default", ['json', 'css', 'js']);
