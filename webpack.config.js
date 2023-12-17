const path = require('path');

module.exports = {
  entry: './app/index.ts',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'webcon.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
