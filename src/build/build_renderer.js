const fs = require('fs');
const cheerio = require('cheerio');

var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

const includes = ['./index.js', './components'];

const scripts = get_script_file();
build_scripts(scripts);

function get_script_file(){
    const html_file = fs.readFileSync('./index.html');
    const $ = cheerio.load(html_file.toString());

    const el_scripts = $('script').get();
    const el_local_scripts = el_scripts.filter((script) => {
       
        let result = false;
        for(var i = 0; i < includes.length; i++){
            if(script.attribs.src.startsWith(includes[i])){
                result = true;
                break;
            }
        }
        return result;
    });

    const local_scripts = el_local_scripts.map((script) => script.attribs.src);
    return local_scripts;
}


function build_scripts(scripts) {
    try{
        return gulp.src(scripts, { sourcemaps: true })
        .pipe(babel())
        .pipe(concat('index.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    }catch(e){
        console.error(e);
    }
}