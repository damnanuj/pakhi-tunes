import { ScrollView, Image, Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  scale,
  verticalScale,
  moderateScale,
} from "src/utils/functions/dimensions";
import MyText from "src/components/customTabBars/styleComponents/MyText";
import themeColors from "src/utils/theme/colors";
import { Download } from "@tamagui/lucide-icons";

const COLUMN_WIDTH = scale(240);
const IMAGE_SIZE = moderateScale(56);
const ICON_SIZE = moderateScale(40);

const TOP_MUSICS = [
  {
    id: "1",
    artist: "Britney",
    song: "Obladet",
    thumbnail:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    isDownloading: true,
  },
  {
    id: "2",
    artist: "Britney",
    song: "Obladet",
    thumbnail:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "3",
    artist: "Britney",
    song: "Obladet",
    thumbnail:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "4",
    artist: "Taylor Swift",
    song: "Anti-Hero",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "5",
    artist: "The Weeknd",
    song: "Blinding Lights",
    thumbnail:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "6",
    artist: "Dua Lipa",
    song: "Levitating",
    thumbnail:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "7",
    artist: "Ed Sheeran",
    song: "Shape of You",
    thumbnail:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "8",
    artist: "Adele",
    song: "Easy On Me",
    thumbnail:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100&h=100&fit=crop",
    isDownloading: false,
  },
  {
    id: "9",
    artist: "Billie Eilish",
    song: "Bad Guy",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
    isDownloading: false,
  },
];

function MusicRowItem({ item }: { item: (typeof TOP_MUSICS)[number] }) {
  return (
    <XStack items="center" gap={scale(12)} flex={1} minWidth="100%">
      <Image
        source={{ uri: item.thumbnail }}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: moderateScale(8),
        }}
        resizeMode="cover"
      />
      <YStack flex={1} minWidth={0} justify="center">
        <MyText
          fontSize={moderateScale(14)}
          fontWeight="600"
          color={themeColors.dark.onSurface}
          numberOfLines={2}
        >
          {item.artist}
        </MyText>
        <MyText
          fontSize={moderateScale(12)}
          color={themeColors.dark.textMuted}
          numberOfLines={2}
        >
          {item.song}
        </MyText>
      </YStack>
      <Pressable>
        <XStack
          width={ICON_SIZE}
          height={ICON_SIZE}
          rounded={ICON_SIZE / 2}
          borderWidth={1}
          borderColor={
            item.isDownloading
              ? themeColors.dark.accent
              : themeColors.dark.border
          }
          backgroundColor={
            item.isDownloading
              ? themeColors.dark.accent
              : themeColors.dark.surfaceSecondary
          }
          alignItems="center"
          justifyContent="center"
        >
          <Download
            size={moderateScale(18)}
            color={
              item.isDownloading
                ? themeColors.dark.onAccent
                : themeColors.dark.onSurface
            }
          />
        </XStack>
      </Pressable>
    </XStack>
  );
}

function MusicColumn({ items }: { items: (typeof TOP_MUSICS)[number][] }) {
  return (
    <YStack width={COLUMN_WIDTH} gap={verticalScale(16)}>
      {items.map((item) => (
        <MusicRowItem key={item.id} item={item} />
      ))}
    </YStack>
  );
}

export default function TopMusicsSection() {
  const columns = [];
  for (let i = 0; i < TOP_MUSICS.length; i += 3) {
    columns.push(TOP_MUSICS.slice(i, i + 3));
  }

  return (
    <YStack px={scale(20)}>
      <XStack justify="space-between" items="center" mb={verticalScale(16)}>
        <MyText
          fontSize={moderateScale(18)}
          fontWeight="600"
          color={themeColors.dark.onSurface}
        >
          Top Musics
        </MyText>
        <MyText fontSize={moderateScale(14)} color={themeColors.dark.accent}>
          See All
        </MyText>
      </XStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: scale(16),
          paddingRight: scale(20),
        }}
      >
        {columns.map((columnItems, index) => (
          <MusicColumn key={index} items={columnItems} />
        ))}
      </ScrollView>
    </YStack>
  );
}
