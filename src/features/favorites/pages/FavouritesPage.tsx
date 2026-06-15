import { FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { YStack } from "tamagui";
import ScreenHeader from "src/components/ScreenHeader";
import MyText from "src/components/MyText";
import themeColors from "src/utils/theme/colors";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import { useScrollBottomInset } from "src/hooks";
import { useAuth } from "src/features/auth/hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteListItem from "../components/FavoriteListItem";

export default function FavouritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useFavorites();
  const favorites = data?.results ?? [];
  const scrollBottomPadding = useScrollBottomInset({
    includeTabBar: true,
    extra: verticalScale(32),
  });

  return (
    <YStack flex={1} bg={themeColors.dark.background}>
      <ScreenHeader title="Favourites" showBack showSettings={false} />

      {!isAuthenticated ? (
        <YStack px={scale(20)} pt={verticalScale(12)} pb={verticalScale(4)}>
          <MyText color={themeColors.dark.textMuted} fontSize={moderateScale(13)}>
            Sign in to back up your favourites across devices.
          </MyText>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth",
                params: {
                  mode: "signin",
                  redirect: "/(tabs)/profile/favourites",
                },
              })
            }
            activeOpacity={0.85}
            style={{ marginTop: verticalScale(8), alignSelf: "flex-start" }}
          >
            <MyText color={themeColors.dark.accent} weight="600">
              Sign in
            </MyText>
          </TouchableOpacity>
        </YStack>
      ) : null}

      {isLoading ? (
        <YStack px={scale(20)} py={verticalScale(24)}>
          <MyText color={themeColors.dark.textMuted}>Loading favourites...</MyText>
        </YStack>
      ) : isError ? (
        <YStack px={scale(20)} py={verticalScale(24)}>
          <MyText color="red">Unable to load favourites.</MyText>
        </YStack>
      ) : favorites.length === 0 ? (
        <YStack px={scale(20)} py={verticalScale(24)}>
          <MyText color={themeColors.dark.textMuted}>
            Songs you favourite will appear here.
          </MyText>
        </YStack>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FavoriteListItem favorite={item} />}
          contentContainerStyle={{
            paddingHorizontal: scale(20),
            paddingBottom: scrollBottomPadding,
          }}
        />
      )}
    </YStack>
  );
}
