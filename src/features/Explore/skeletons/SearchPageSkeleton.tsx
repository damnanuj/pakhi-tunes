import { FlatList } from "react-native";
import { verticalScale } from "src/utils/functions/dimensions";
import SongListItemSkeleton from "src/features/ArtistSongs/skeletons/SongListItemSkeleton";

const SKELETON_COUNT = 10;

export default function SearchPageSkeleton() {
  const data = Array.from({ length: SKELETON_COUNT }, (_, i) => ({ key: i }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.key)}
      renderItem={() => <SongListItemSkeleton />}
      contentContainerStyle={{
        paddingBottom: verticalScale(40),
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
