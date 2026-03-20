import { memo, useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import themeColors from "src/utils/theme/colors";
import { moderateScale, scale } from "src/utils/functions/dimensions";

/** Matches FullPlayer scroll `paddingHorizontal: scale(20)` on both sides. */
const SCROLL_H_PAD = scale(20) * 2;

type MockWaveformBarProps = {
  progress: number;
  width: number;
};

/**
 * Decorative waveform: fills the section width; vertical pills, symmetric on midline,
 * accent = played, white = remaining (abrupt boundary at progress).
 */
function MockWaveformBar({ progress, width }: MockWaveformBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setMeasuredWidth((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
  }, []);

  const { barCount, barWidth, gapBase, gapExtra, heights, trackHeight } =
    useMemo(() => {
    const sectionWidth = Math.max(
      100,
      measuredWidth > 0 ? measuredWidth : width - SCROLL_H_PAD
    );
    const bw = moderateScale(3.75);
    const minGap = scale(2);

    let count = Math.floor((sectionWidth + minGap) / (bw + minGap));
    count = Math.min(52, Math.max(22, count));

    while (count > 22) {
      const nGaps = count - 1;
      const spaceForGaps = sectionWidth - count * bw;
      const gFloor =
        nGaps > 0 ? Math.floor(Math.max(0, spaceForGaps) / nGaps) : 0;
      if (gFloor >= minGap) break;
      count -= 1;
    }

    const nGaps = Math.max(0, count - 1);
    const spaceForGaps = Math.max(0, sectionWidth - count * bw);
    const gapBase =
      nGaps > 0 ? Math.floor(spaceForGaps / nGaps) : 0;
    const gapExtra = nGaps > 0 ? spaceForGaps - gapBase * nGaps : 0;

    const minH = moderateScale(3);
    const maxH = moderateScale(46);

    const h = Array.from({ length: count }, (_, i) => {
      const n = count > 1 ? i / (count - 1) : 0;
      const w1 = Math.sin(n * Math.PI * 12.4) * 0.5 + 0.5;
      const w2 = Math.sin(n * Math.PI * 21.7 + 0.9) * 0.5 + 0.5;
      const w3 = Math.sin(n * Math.PI * 5.3 + 2.4) * 0.5 + 0.5;
      const w4 = Math.sin(n * Math.PI * 31.1 + 1.1) * 0.5 + 0.5;
      const r = (((i * 7919 + 49297) % 997) / 997) * 0.5 + 0.5;
      const mix = w1 * 0.22 + w2 * 0.22 + w3 * 0.2 + w4 * 0.18 + r * 0.18;
      return minH + mix * (maxH - minH);
    });

    return {
      barCount: count,
      barWidth: bw,
      gapBase,
      gapExtra,
      heights: h,
      trackHeight: maxH + moderateScale(8),
    };
  }, [measuredWidth, width]);

  const playedCount =
    clamped >= 1 ? barCount : Math.floor(clamped * barCount);

  const accent = themeColors.dark.accent;
  const remaining = themeColors.dark.onSurface;

  return (
    <View
      onLayout={onLayout}
      style={{
        alignSelf: "stretch",
        width: "100%",
        height: trackHeight,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {heights.map((h, i) => (
        <View
          key={`wf-${i}`}
          style={{
            width: barWidth,
            height: h,
            marginRight:
              i < barCount - 1 ? gapBase + (i < gapExtra ? 1 : 0) : 0,
            borderRadius: barWidth / 2,
            backgroundColor: i < playedCount ? accent : remaining,
          }}
        />
      ))}
    </View>
  );
}

export default memo(MockWaveformBar);
