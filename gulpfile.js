var gulp = require("gulp");
var sass = require("gulp-sass");
var notify = require("gulp-notify");
var browserSync = require("browser-sync").create();
var gulpImport = require("gulp-html-import");
// Para optimizar las imágenes
var imagemin = require("gulp-imagemin");
// nuevos
var tap = require("gulp-tap");
var browserify = require("browserify");
var buffer = require("gulp-buffer");

// nuevos
var sourcemaps = require("gulp-sourcemaps");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");


gulp.task("default", ["img","html", "sass", "js"], function(){
    browserSync.init({ server: "dist/" });
    gulp.watch(["src/scss/*.scss", "src/scss/**/*.scss"], ["sass"]);
    gulp.watch(["src/*.html", "src/**/*.html"], ["html"]);
    // observa cambios en los archivos JS y entonces ejecuta la tarea 'js'
    gulp.watch(["src/js/*.js","src/js/**/*.js"], ["js"]);

});

gulp.task("sass", function(){
    gulp.src("src/scss/style.scss")
        .pipe(sourcemaps.init()) // comienza a capturar los sourcemaps
        .pipe(sass().on("error", function(error){ 
            return notify().write(error); 
        }))
        .pipe(postcss([
            autoprefixer(), //transforma el CSS dándole compatibilidad a versiones antiguas
            cssnano() //comprime/minifica el CSS
        ]))
        .pipe(sourcemaps.write("./")) // guarda el sourcemaps en la misma carpeta que el CSS
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("SASS Compilado OK"))
});

gulp.task("html", function(){
    gulp.src("src/*.html")
        .pipe(gulpImport("src/components/"))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream())
        .pipe(notify("HTML importado"));
});

// tarea que optimiza las imágenes
// Cogemos las imágenes de "src/img/*", optimizamos su peso y las llevo a "dist/img/"
gulp.task("img", function(){
    gulp.src("src/img/*")
        .pipe(imagemin())
        .pipe(gulp.dest("dist/img/"))
});

// compilar y generar un único javascript
gulp.task("js", function() {
    gulp.src("src/js/main.js")
        .pipe(tap(function(file){
            file.contents = browserify(file.path)
                            .transform("babelify", {presets: ["es2015"]})
                            .bundle() // compilamos el archivo
                            .on("error", function(error){
                                return notify().write(error);
                            });
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps:true})) // captua los sourcemaps del
    .pipe(uglify()) //minificamos el JavaScript
    .pipe(sourcemaps.write('./')) //guarda los sourcemaps en el mismo directorio
    .pipe(gulp.dest("dist/"))
    .pipe(browserSync.stream())
    .pipe(notify("JS Compilado"));
});