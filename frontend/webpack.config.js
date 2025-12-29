const path = require("path");

module.exports = {

  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/", // for React Router
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,            // handle .js and .jsx
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,                 // handle CSS imports
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:4000',
    //     changeOrigin: true,
    //   },
    // },
    historyApiFallback: true,          // so React Router works on refresh
    port: 8081,                        // matches what you see in the log
    hot: true,
    open: true,
  },
  mode: "development",
};
