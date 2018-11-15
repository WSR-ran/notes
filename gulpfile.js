const gulp = require('gulp');
const connect = require('gulp-connect');
const open = require('gulp-open');

const rootPath='./';
gulp.task('serve',function () { 
　　connect.server({ 
　　　　root:rootPath,　　 
　　　　livereload:true,　　
　　　　port:5000　　　　
　　}); 
　  open('http://localhost:5000');　　 
    gulp.watch(rootPath + 'public/*.html', ['html']);
    gulp.watch(rootPath + 'public/*.css', ['css']);　
});
gulp.task('html',function () { 
    gulp.src(rootPath + 'public/*.html')
    .pipe(connect.reload()); 　
}); 
gulp.task('css',function () { 
    gulp.src(rootPath + 'public/*.css') 
    .pipe(connect.reload());  
});
gulp.task('default',['serve']);   //直接gulp即可
