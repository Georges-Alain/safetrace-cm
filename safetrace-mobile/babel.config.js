module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['expo/internal/babel-preset'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
    ],
  };
};
