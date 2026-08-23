import Constants from "expo-constants";

// True when running inside Expo Go. Expo Go (SDK 53+) removed remote push and
// even importing `expo-notifications` throws there, so this flag gates all
// notification code off in Expo Go. It re-enables automatically in a dev or
// production build. Kept in its own tiny module (only depends on
// expo-constants) so importing it never pulls in expo-notifications.
export const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";
