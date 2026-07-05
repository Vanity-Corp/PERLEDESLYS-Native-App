// Ambient module declaration for SVG imports transformed by
// react-native-svg-transformer (see metro.config.js) into React components
// backed by react-native-svg, per that package's own documented type shape.

declare module "*.svg" {
  import type { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
