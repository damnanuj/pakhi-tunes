import React from "react";
import { Image, ImageSourcePropType } from "react-native";
import { moderateScale } from "src/utils/functions/dimensions";

interface AvatarProps {
  source: ImageSourcePropType;
  size?: number;
}

export default function Avatar({ source, size = moderateScale(72) }: AvatarProps) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      resizeMode="cover"
    />
  );
}
