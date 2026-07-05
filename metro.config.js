const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

// Lets `import Logo from "./logo.svg"` resolve to a React component (the
// new brand assets — ogee-arch.svg, the wordmark, the no-text mark — are
// complex multi-path vectors, so transforming them at build time is far
// more maintainable than hand-transcribing their path data into JSX.
const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });