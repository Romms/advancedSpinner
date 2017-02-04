var gulp = require("gulp"),
    rename = require("gulp-rename"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    sourcemaps = require("gulp-sourcemaps"),
    autoprefixer = require("gulp-autoprefixer"),
    cleanCss = require("gulp-clean-css"),
    sass = require("gulp-sass"),
    watch = require('gulp-watch'),
    debug = require('gulp-debug'),
    prettyError = require('gulp-prettyerror'),
    del = require('del'),
    runSequence = require('run-sequence'),
    babel = require('gulp-babel');

var path = {
    src: {
        js: "src/js/**/*.js",
        sass: "src/sass/**/*.{scss,sass}"
    }
};

gulp.task("dist:js", function () {
    gulp.src(path.src.js)
        .pipe(prettyError())
        .pipe(debug())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat("jquery.advancedSpinner.js"))
        .pipe(gulp.dest("dist"))
        .pipe(rename("jquery.advancedSpinner.min.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist"));
});

gulp.task("dist:styles", function () {
    gulp.src(path.src.sass)
        .pipe(prettyError())
        .pipe(debug())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cleanCss())
        .pipe(concat("jquery.advancedSpinner.min.css"))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist"));
});

gulp.task('dist:clean', function () {
    return del(['dist']);
});

gulp.task('watch', function () {
    gulp.watch(path.src.js, ["dist:js"]);
    gulp.watch(path.src.sass, ["dist:styles"]);
});

gulp.task("default", function (done) {
    runSequence("dist:clean", "dist:js", "dist:styles", "watch", done);
});