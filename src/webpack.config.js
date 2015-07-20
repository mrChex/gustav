var webpack = require('webpack'),
    path = require('path'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

var VENDOR_LIBS = [
    'react',
    'react-router',
    'jquery',
    'classnames',
    'bootstrap-sass!./bootstrap.config.js',
    'immutable'
];

module.exports = {
    entry: {
        app: './app/javascript/routes.jsx',
        vendor: VENDOR_LIBS
    },
    output: {
        path: path.join(__dirname, '/app/build'),
        filename: "bundle.js",
        publicPath: '/app/build/',
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        modulesDirectories: ['node_modules'],
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loaders: ['babel'],
                exclude: /node_modules|bower_components/
            },

            { test: /\.css$/, loader: 'style-loader!css' },
            {
              test: /\.scss$/,
              loader: "style!css!sass?outputStyle=expanded&includePaths[]=" +
                (path.resolve(__dirname, "./node_modules"))
            },
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: "url?limit=10000&minetype=application/font-woff" },
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,  loader: "url?limit=10000&minetype=application/font-woff" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&minetype=application/octet-stream" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&minetype=image/svg+xml" }

        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'window.jQuery': 'jquery'
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.optimize.CommonsChunkPlugin(
            /* chunkName= */"vendor", /* filename= */"vendor.bundle.js"
        )
    ],
    devtool: 'source-map' // source maps with debugging, slow
    //devtool: 'eval-source-map'
};
