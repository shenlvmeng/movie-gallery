import gulp from 'gulp';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import jsonminify from 'gulp-jsonminify';
import webserver from 'gulp-webserver';
import webpack from 'webpack-stream';

gulp.task('js', function () {
	return gulp.src('src/index.js')
    .pipe(webpack({
      module: {
        rules: [
          { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
      }
    }))
    .pipe(rename("index.js"))
		.pipe(gulp.dest('dist'));
});

gulp.task('minify', function () {
  return gulp.src('dist/index.js')
    .pipe(uglify())
    .pipe(rename("index.min.js"))
    .pipe(gulp.dest("dist"));
})

gulp.task('css', function () {
	return gulp.src(['src/index.css'])
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('json', function () {
	return gulp.src('src/meta*.json')
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

gulp.task('assets', ['json', 'css', 'js']);
gulp.task('default', ['assets', 'webserver', 'watch']);
gulp.task("release", ['assets', 'minify']);
