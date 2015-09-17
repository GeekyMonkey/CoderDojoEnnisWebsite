/// <binding BeforeBuild='default' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp');
var ts = require('gulp-typescript');
var bower = require('gulp-bower');

gulp.task('bower', function () {
    // Copy angular
    //gulp.src([
    //'node_modules/systemjs/dist/*.*',
    //]).pipe(gulp.dest('wwwroot/lib/systemjs'));

    //return bower().pipe(gulp.dest('wwwroot/lib/'))
});

gulp.task('tsbuild', function () {
    var tsResult = gulp.src('ts/*.ts')
    .pipe(ts({
        noImplicitAny: true,
        experimentalDecorators: true,
        module: "commonjs",
        target: "es5"
    }))
    .pipe(gulp.dest("wwwroot/js"));
});

gulp.task('default', ['bower', 'tsbuild']);
