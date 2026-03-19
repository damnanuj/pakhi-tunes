import { TouchableOpacity, StyleSheet, View as RNView } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  scale,
  moderateScale,
  moderateVerticalScale,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function BottomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <RNView
      style={[
        styles.container,
        {
          backgroundColor: themeColors.dark.surface,
          // paddingBottom: Math.max(insets.bottom, 0),
          overflow: "hidden",
        },
      ]}
    >
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={styles.tabItemWrapper}
          >
            {isFocused ? <RNView style={styles.focusedBackground} /> : null}

            <View style={styles.tabItemContent}>
              {getIconByRouteName(
                route.name,
                isFocused
                  ? themeColors.dark.onAccent
                  : themeColors.dark.onSurface
              )}
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={[styles.text, { color: themeColors.dark.onAccent }]}
                >
                  {label as string}
                </Animated.Text>
              )}
            </View>
          </AnimatedTouchableOpacity>
        );
      })}
    </RNView>
  );

  function getIconByRouteName(routeName: string, color: string) {
    const iconSize = moderateScale(20);
    switch (routeName) {
      case "index":
      case "home":
        return <Ionicons name="home" size={iconSize+4} color={color} />;
      case "explore":
        return (
          <FontAwesome6 name="magnifying-glass" size={iconSize} color={color} />
        );
      case "library":
        return (
          <MaterialIcons
            name="library-music"
            size={moderateScale(24)}
            color={color}
          />
        );
      case "profile":
        return <FontAwesome5 name="user-alt" size={iconSize} color={color} />;
      default:
        return <Feather name="home" size={iconSize} color={color} />;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    // borderWidth: 1,
    // borderColor: "red",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    zIndex: 999,
    width: "100%",
    height: moderateVerticalScale(80),
    alignSelf: "center",
    bottom: 0,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingHorizontal: scale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabItemWrapper: {
    // borderWidth: 1,
    // borderColor: "blue",
    height: moderateVerticalScale(43),
    borderRadius: moderateScale(30),
    overflow: "hidden",
    flexShrink: 1,
  },
  focusedBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: moderateScale(30),
    backgroundColor: themeColors.dark.accent,
  },
  tabItemContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: scale(20),
    zIndex: 10,
  },
  text: {
    textTransform: "capitalize",
    marginLeft: scale(8),
    fontWeight: "500",
    fontSize: moderateScale(14),
  },
});
