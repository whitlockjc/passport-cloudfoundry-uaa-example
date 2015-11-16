'use strict';

var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var server = require('./');
var port = 3000;

gulp.task('serve', function() {
  server.start(port);

  browserSync.init({
    proxy: 'http://localhost:' + port,
    files: ['public/**/*']
  });

  gulp.watch("app/**/*").on('change', browserSync.reload);
});
