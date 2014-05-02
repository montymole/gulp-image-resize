/*
 * grunt-image-resize
 * https://github.com/scalableminds/gulp-image-resize
 *
 * Copyright (c) 2014 Norman Rzepka
 * Licensed under the MIT license.
 */

var gm 		= require('gm').subClass({ imageMagick: true });
var async       = require("async");
var path        = require("path");
var os          = require("os");
var through     = require("through2");
var _           = require("lodash");
var stream      = require("stream");
var util        = require("gulp-util");
var PluginError = util.PluginError;

const PLUGIN_NAME = "gulp-image-resize";

module.exports = function imageResizer(options) {

  options = _.defaults(options, {
    overwrite   : true,
    upscale     : false,
    crop        : false,
    gravity     : "Center",
    quality     : 1,
    imageMagick : false,
    format      : null
  });

  if (options.height == null && options.width) {
    options.height = null;
  }
  if (options.width == null && options.height) {
    options.width = null;
  }

  return gm(function(gmfile, done) {

    async.waterfall([

      function (callback) {
        gmfile.size(callback);
      },

      function (size, callback) {

        if (options.height != null || options.width != null) {

          var isUpscaled =
            (options.width && size.width < options.width) ||
            (options.height && size.height < options.height);

          if (options.upscale || !isUpscaled) {

            if (isUpscaled) {
              if (!options.height) {
                options.height = Math.ceil((options.width / size.width) * size.height);
              }
              if (!options.width) {
                options.width = Math.ceil((options.height / size.height) * size.width);
              }
            }

            if (options.crop) {
              gmfile = gmfile
                .resize(options.width, options.height, "^")
                .gravity(options.gravity)
                .crop(options.width, options.height);
            } else {
              gmfile = gmfile
                .resize(options.width, options.height);
            }

          }

        }

        if (options.format) {
          gmfile = gmfile
            .setFormat(options.format);
        }

        if (options.quality !== 1) {
          gmfile = gmfile.quality(Math.floor(options.quality * 100));
        }

        callback(null, gmfile);
      }

    ], done);

  }, { imageMagick : options.imageMagick });

};

