const path = require('path');

module.exports = {
  entry: './public/js/index.js', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/, // همه فایل‌های جاوااسکریپت را با استفاده از babel-loader پردازش می‌کند
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
