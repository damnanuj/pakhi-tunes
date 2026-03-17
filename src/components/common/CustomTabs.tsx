import React, { useState } from "react";

import { MotiView } from "moti";

import { Dimensions, Pressable } from "react-native";
import { Stack, useTheme, XStack } from "tamagui";
import { moderateScale } from "src/utils/functions/dimensions";
import MyText from "../customTabBars/styleComponents/MyText";
const { width: screenWidth } = Dimensions.get("window");

const CustomTabs = ({ tabs, activeTab, setActiveTab }: any) => {
  const activeIndex = tabs?.findIndex((tab: any) => tab?.key === activeTab);
  const containerPixelWidth = screenWidth;
  const tabWidth = 100 / Number(tabs?.length);
  const translateXValue = Number(tabWidth);
  const [hStackWidth, setHStackWidth] = useState(screenWidth);
  const singleTabPixelWidth = hStackWidth / tabs?.length;
  const translateXPixelValue = activeIndex * singleTabPixelWidth;
  const theme = useTheme();
  return (
    <Stack
      width="100%"
      height={moderateScale(50)}
      justify="center"
      items="center"
      borderWidth={1}
      borderColor={"$accentYellow"}
      rounded={moderateScale(150)}
    >
      <XStack
        borderColor={"$accentYellow"}
        width="100%"
        height="100%"
        position="relative"
        overflow="hidden"
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setHStackWidth(width);
        }}
      >
        <MotiView
          from={{ translateX: translateXPixelValue }}
          animate={{ translateX: translateXPixelValue }}
          transition={{ type: "spring", damping: 50, stiffness: 150 }}
          style={{
            position: "absolute",
            width: `${100 / tabs.length}%`,
            height: "100%",
            backgroundColor: theme.accentYellow.val,
            borderRadius: moderateScale(100),
            borderColor: theme.accentYellow,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
            elevation: 4,
          }}
        />

        {tabs.map((tab: any) => (
          <Pressable
            key={tab.key}
            flex={1}
            justifyContent="center"
            alignItems="center"
            onPress={() => setActiveTab(tab.key)}
          >
            <MyText
              fontSize={moderateScale(13)}
              fontWeight={700}
              color={activeTab === tab.key ? "$background" : "$accentYellow"}
            >
              {tab.label}
            </MyText>
          </Pressable>
        ))}
      </XStack>
    </Stack>
  );
};

export default CustomTabs;
