var gulp = require('gulp'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css'),
    jsonminify = require('gulp-jsonminify'),
    webserver = require('gulp-webserver');

gulp.task('js', function () {
	return gulp.src('assets/src/*.js')
		.pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
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

gulp.task('watch', function() {
  gulp.watch('assets/src/*.js', ['js']);
  gulp.watch('assets/src/*.css', ['css']);
  gulp.watch('assets/src/*.json', ['json']);
})

gulp.task('dev', ['default', 'webserver', 'watch']);
gulp.task("default", ['json', 'css', 'js']);
