const path = require('node:path');

const html = require('html-webpack-plugin');
const css = require('mini-css-extract-plugin');
const webpack = require("webpack");
const WorkboxPlugin = require('workbox-webpack-plugin');
// https://github.com/aackerman/circular-dependency-plugin
const CircularDependencyPlugin = require('circular-dependency-plugin')

const getDirectory = (directory) => path.resolve(__dirname, directory);




module.exports = (env) => {
  const isProduction = Boolean(env.environment === 'production');
  const device = env.device;
  const isMobile = Boolean(device==="phone" || device==="tablet");
  const isServiceWorker = Boolean (device==="service-worker");
  return {
    target: 'browserslist',
    entry: {
      index: isServiceWorker ? getDirectory('src/js/firebase-messaging-sw.ts') : getDirectory(isMobile ? 'src/js/mobile.ts' : 'src/js/desktop.ts')
    },
    output: {
      path: getDirectory(
        Boolean(device==="phone") ? 'dist/phone' : 
        Boolean(device==="tablet") ? "dist/tablet" : 
        Boolean(device==="desktop") ? 'dist/desktop' : 
        Boolean(device==="service-worker") ? 'dist/firebase-messaging-sw' :
        'dist/desktop'
      ),
      filename: isServiceWorker ? 'firebase-messaging-sw.js' : `${isMobile ? 'mobile' : 'desktop'}.[contenthash].min.js`,
      chunkFilename: (pathData) => {
        if (pathData.chunk.name&&(
          pathData.chunk.name.includes('codemirror')||
          pathData.chunk.name.includes('personal-website-shared')||
          pathData.chunk.name.includes('pintura-image-editor')
        )) {
          return `[name].chunk.bundle.js`;
        } else {
          return '[name].[contenthash].chunk.bundle.js';
        }
      },
      clean: true
    },
    resolve: {
      alias: {
        "personal-website-shared": path.resolve(__dirname,"src","js","personal-website-shared")
      },
      extensions: [".js",".ts",".css"]
    },
    plugins: [
      new html({
        device: device,
        template: getDirectory('src/index.html'),
      }),
      new css({
        filename: isProduction ? '[name].[fullhash].css' : '[name].css',
        attributes: { "hx-preserve": "true" },
        linkType: "text/css",
      }),
      new webpack.DefinePlugin({
        WEBPACK_PROCESS: `"${env.environment}"`
      })
      // new BundleAnalyzerPlugin({openAnalyzer: true})
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: '/node_modules/',
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        },
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(sass|scss|css)$/i,
          use: [
            {
              loader: css.loader
            },
            {
              loader: 'css-loader'
            },
            {
              loader: "sass-loader",
              options: {
                // Prefer `dart-sass`, even if `sass-embedded` is available
                implementation: require("sass"),
              },
            }
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          loader: 'file-loader',
          options: {
            outputPath: 'assets'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext][query]'
          }
        }
      ]
    },
    
    optimization: {
      minimize: isProduction
    },
    devServer: {
      static: {
        directory: isProduction ? getDirectory('dist') : getDirectory('src')
      },
      hot: false,
      server: 'http',
      historyApiFallback: true,
      proxy: {
        '/api': 'http://localhost:3000/'
      },
      port: 8080
    },
    devtool: !!!isProduction ? 'source-map' : undefined
  };
};

