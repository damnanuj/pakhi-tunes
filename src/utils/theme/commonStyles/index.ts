import { Platform, StatusBar } from "react-native";

const cs: any = {
  CENTER: {
    justifyContent: "center",
    alignItems: "center",
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
};

export default cs;
