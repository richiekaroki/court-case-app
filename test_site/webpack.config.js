const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './app.js', // Your main JavaScript file
    mode: 'development',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // Output directory
        clean: true, // Clean the output directory before each build
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // If using Babel
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-syntax-jsx']
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                  filename: 'assets/[name][ext]'
                }
              }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', // Path to your HTML file
            inject: 'head', // Inject all scripts into the body
        }),
        new CopyWebpackPlugin({
            patterns: [
              { from: 'assets', to: 'assets' }
            ],
          }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        // path.join(__dirname, 'dist'), // Serve files from the dist directory
        compress: true,
        port: 9000, // You can change the port if needed
        open: true, // Automatically open the browser
        historyApiFallback: true, // Enable for SPA routing
    },
};
