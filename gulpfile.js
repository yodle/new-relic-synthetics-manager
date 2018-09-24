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

gulp.task('test', gulp.series('pre-test', () => {
  return gulp.src('./test/**/*.js')
    .pipe(mocha({reporter: 'spec' }))
    // Ugly hack because the mocha plugin doesn't properly exit with an exit code on test failures
    .on('error', (err) => { process.exit(1) })
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
}));


gulp.task('default', gulp.series('lint', 'test'));