import { useRef } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  View,
  Animated,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { ChevronRight } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { YStack } from "tamagui";
import MyText from "src/components/MyText";
import {
  scale,
  verticalScale,
  moderateScale,
  SCREEN_WIDTH,
} from "src/utils/functions/dimensions";
import themeColors from "src/utils/theme/colors";

const BUTTON_HEIGHT = verticalScale(65);
const THUMB_SIZE = 50;
const TRIGGER_THRESHOLD = 0.75; // 75% slide to trigger

export default function EntryPage() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const maxSlideRef = useRef(SCREEN_WIDTH - scale(48) - THUMB_SIZE - scale(16));

  const triggerAction = () => {
    router.replace("/(tabs)/home");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gestureState) => {
        const maxSlide = maxSlideRef.current;
        const newX = Math.max(0, Math.min(gestureState.dx, maxSlide));
        slideAnim.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const maxSlide = maxSlideRef.current;
        const currentX = gestureState.dx;
        const triggerX = maxSlide * TRIGGER_THRESHOLD;

        if (currentX >= triggerX) {
          Animated.timing(slideAnim, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: true,
          }).start(() => triggerAction());
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      maxSlideRef.current = w - THUMB_SIZE - scale(16);
    }
  };

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <YStack flex={1}>
        <Image
          source={require("../../../../assets/images/entry-hero.jpg")}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "cover",
          }}
        />
        <LinearGradient
          colors={["transparent", themeColors.dark.background]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: scale(24),
            paddingBottom: verticalScale(16),
            paddingTop: verticalScale(60),
          }}
        >
          <View>
            <MyText
              fontSize={moderateScale(32)}
              weight="800"
              color={themeColors.dark.onSurface}
              mb={verticalScale(8)}
            >
              Music
            </MyText>
            <MyText
              fontSize={moderateScale(14)}
              width="80%"
              color={themeColors.dark.onSurface}
              opacity={0.9}
              lineHeight={moderateScale(24)}
              style={{ maxWidth: scale(320) }}
            >
              Let's Explore Stream thousands of songs to lift your mood and keep
              the rhythm going.
            </MyText>
          </View>
        </LinearGradient>
      </YStack>

      <YStack px={scale(24)} pb={verticalScale(32)} pt={verticalScale(16)}>
        <View
          onLayout={onTrackLayout}
          style={{
            height: BUTTON_HEIGHT,
            backgroundColor: themeColors.dark.background,
            borderRadius: BUTTON_HEIGHT / 2,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.15)",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: BUTTON_HEIGHT,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MyText
              fontSize={moderateScale(16)}
              weight="700"
              color={themeColors.dark.onSurface}
            >
              Let's Get Started
            </MyText>
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={{
              position: "absolute",
              left: scale(6),
              top: (BUTTON_HEIGHT - THUMB_SIZE) / 2,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: themeColors.dark.accent,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ translateX: slideAnim }],
            }}
          >
            <ChevronRight size={22} color={themeColors.dark.onAccent} />
          </Animated.View>
        </View>
      </YStack>
    </YStack>
  );
}
