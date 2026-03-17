import { TouchableOpacity, StyleSheet, View as RNView } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, View } from "tamagui";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
import { scale, verticalScale, moderateScale, moderateVerticalScale } from "src/utils/functions/dimensions";

const ACTIVE_BG_COLOR = "rgba(255, 255, 255, 0.15)";
const INACTIVE_ICON_COLOR = "#ffffff";
const ACTIVE_TEXT_COLOR = "#ffffff";

const BottomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <RNView
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, verticalScale(10)),
          backgroundColor: "#1a1a1a",
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
            key={route.key}
            onPress={onPress}
            style={styles.tabItemWrapper}
            activeOpacity={0.7}
          >
            <View style={styles.tabItemContent}>
              {isFocused && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.activePill}
                />
              )}
              {getIconByRouteName(
                route.name,
                isFocused,
                isFocused ? ACTIVE_TEXT_COLOR : INACTIVE_ICON_COLOR
              )}
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(200).springify()}
                  exiting={FadeOut.duration(150)}
                  style={styles.activeText}
                >
                  {label as string}
                </Animated.Text>
              )}
            </View>

            {isFocused && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.indicatorLine}
              />
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </RNView>
  );

  function getIconByRouteName(
    routeName: string,
    isFocused: boolean,
    color: string
  ) {
    const iconSize = moderateScale(20);

    switch (routeName) {
      case "index":
      case "home":
        return (
          <Ionicons
            name={isFocused ? "home" : "home-outline"}
            size={iconSize}
            color={color}
          />
        );
      case "friends":
        return (
          <Feather
            name={isFocused ? "users" : "users"}
            size={iconSize}
            color={color}
          />
        );
      case "activity":
        return (
          <Feather
            name={isFocused ? "activity" : "activity"}
            size={iconSize}
            color={color}
          />
        );
      case "profile":
        return (
          <MaterialCommunityIcons
            name={isFocused ? "account" : "account-outline"}
            size={iconSize}
            color={color}
          />
        );
      default:
        return (
          <Ionicons
            name={isFocused ? "home" : "home-outline"}
            size={iconSize}
            color={color}
          />
        );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    zIndex: 999,
    width: "100%",
    minHeight: moderateVerticalScale(70),
    alignSelf: "center",
    bottom: 0,
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    paddingHorizontal: scale(8),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  tabItemWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: verticalScale(8),
    marginHorizontal: scale(4),
  },

  activePill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ACTIVE_BG_COLOR,
    borderRadius: moderateScale(20),
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  tabItemContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 10,
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },

  activeText: {
    color: ACTIVE_TEXT_COLOR,
    fontSize: moderateScale(12),
    fontWeight: "600",
    textTransform: "capitalize",
  },

  indicatorLine: {
    position: "absolute",
    bottom: verticalScale(2),
    width: scale(30),
    height: 2,
    backgroundColor: "#ffffff",
    borderRadius: 1,
  },
});

export default BottomTabBar;
