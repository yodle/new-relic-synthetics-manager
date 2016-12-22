const gulp   = require('gulp');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');


gulp.task('lint', function() {
  return gulp.src('./lib/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('pre-test', () => {
  return gulp.src(['./lib/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
})

gulp.task('test', ['pre-test'], () => {
  return gulp.src('./test/**/*.js')
    .pipe(mocha({reporter: 'spec' }))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});


gulp.task('default', ['lint', 'test']);