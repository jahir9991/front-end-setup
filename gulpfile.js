/*we dont need compass or ruby install for sass compile
  we can just simple use gulp-sass*/


var gulp = require('gulp'),
    gutil = require('gulp-util'),
    /*_______________________Coffeescript conversation____________________________*/
    /**/
    /**/    //coffee = require('gulp-coffee'),      /*Active this line for coffeescript*/
    /*________________________Coffeescript conversation end_______________________*/


    browserify = require('gulp-browserify'),

    sass = require('gulp-sass'),

    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include');

var env, coffeeSources,corejsSources,jsSources,sassSources,htmlSources,jsonSources,outputDir,sassStyle;

env = process.env.NODE_ENV || 'production';

if (env === 'dev') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}


coffeeSources = ['components/coffee/tagline.coffee'];
corejsSources = [

    'components/scripts/vendor/bootstrap.js',
    'components/scripts/vendor/material.min.js'

];
jsSources = [
    'components/scripts/main.js'
];
sassSources = ['components/sass/style.scss'];
htmlSources = ['components/index.html'];
jsonSources = [outputDir + 'js/*.json'];

/*_______________________Coffeescript conversation____________________________*/
// gulp.task('coffee', function() {
//   gulp.src(coffeeSources)
//     .pipe(coffee({ bare: true })
//     .on('error', gutil.log))
//     .pipe(gulp.dest('components/scripts'))
// });
     /*_________________________________________________________________________*/

gulp.task('js', function () {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(uglify())
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});
gulp.task('coreJs', function () {
    gulp.src(corejsSources)
        .pipe(concat('core.js'))
        .pipe(browserify())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});


gulp.task('sass', function () {

    gulp.src(sassSources)
    // .pipe(sass({includePaths: ['components/sass'],outputStyle: 'compressed'}).on('error', gutil.log))
        .pipe(gulpif(env === 'development', sass({includePaths: ['components/sass']}).on('error', gutil.log)))
        .pipe(gulpif(env === 'production', sass({
            includePaths: ['components/sass'],
            outputStyle: 'compressed'
        }).on('error', gutil.log)))
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload())


});


// gulp.task('compass', function() {
//   gulp.src(sassSources)
//     .pipe(compass({
//       sass: 'components/sass',
//       image: outputDir + 'images',
//       style: sassStyle
//     })
//     .on('error', gutil.log))
//     .pipe(gulp.dest(outputDir + 'css'))
//     .pipe(connect.reload())
// });

gulp.task('watch', function () {
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch(corejsSources, ['coreJs']);
    gulp.watch('components/sass/**/*.scss', ['sass']);
    gulp.watch('components/**/*.html', ['html']);
    gulp.watch('builds/development/js/*.json', ['json']);
    gulp.watch('builds/development/images/**/*.*', ['images']);
});

gulp.task('connect', function () {
    connect.server({
        root: outputDir,
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src(htmlSources)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }).on('error', gutil.log))
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(gulp.dest(outputDir))
        .pipe(connect.reload())
});

gulp.task('images', function () {
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        })))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload())
});

gulp.task('json', function () {
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload())
});

gulp.task('default', ['html', 'json', 'coreJs', 'js', 'sass', 'images', 'connect', 'watch']);
