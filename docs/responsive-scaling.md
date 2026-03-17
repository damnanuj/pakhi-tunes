# Responsive Scaling Utility

> **File:** `src/utils/functions/dimensions/index.ts`

A set of scaling functions to make your React Native UI look consistent across all screen sizes — from small phones (iPhone SE) to large phones (iPhone 15 Pro Max) to tablets (iPad).

---

## How It Works

All functions are based on a **design guideline** of **414 × 844** (iPhone 12/13/14 logical pixels). They calculate a ratio between the actual device screen and this base, then apply it to the values you pass in.

```
scale factor = device screen size / guideline base size
```

---

## Available Functions

### 1. `scale(size)`

**Linear horizontal scaling** — scales proportionally with screen **width**.

```tsx
import { scale } from "src/utils/functions/dimensions";

// Examples
paddingHorizontal: scale(20)
marginLeft: scale(16)
gap: scale(12)
```

| Device          | Width  | `scale(20)` |
| --------------- | ------ | ----------- |
| iPhone SE       | 375px  | 18px        |
| iPhone 14       | 414px  | 20px (base) |
| iPhone 15 PM    | 430px  | 21px        |
| iPad Mini       | 744px  | 36px        |
| iPad Pro 12.9"  | 1024px | 49px        |

---

### 2. `verticalScale(size)`

**Linear vertical scaling** — scales proportionally with screen **height**.

```tsx
import { verticalScale } from "src/utils/functions/dimensions";

// Examples
paddingVertical: verticalScale(10)
marginTop: verticalScale(60)
marginBottom: verticalScale(20)
```

| Device          | Height  | `verticalScale(20)` |
| --------------- | ------- | ------------------- |
| iPhone SE       | 667px   | 16px                |
| iPhone 14       | 844px   | 20px (base)         |
| iPhone 15 PM    | 932px   | 22px                |
| iPad Mini       | 1133px  | 27px                |
| iPad Pro 12.9"  | 1366px  | 32px                |

---

### 3. `moderateScale(size, factor?)`

**Dampened scaling** — the most important function. Instead of scaling linearly (which makes things WAY too big on tablets), it scales at a controlled rate.

**Formula:** `size + (scale(size) - size) × factor`

- `factor = 0` → no scaling at all (always returns the original size)
- `factor = 0.3` → gentle scaling
- `factor = 0.5` → default, moderate scaling
- `factor = 0.8` → aggressive scaling
- `factor = 1.0` → same as linear `scale()`

```tsx
import { moderateScale } from "src/utils/functions/dimensions";

// Examples
fontSize: moderateScale(16)           // factor = 0.5 (default)
borderRadius: moderateScale(12, 0.3)  // factor = 0.3 (gentle)
borderWidth: moderateScale(1.5, 0.3)  // factor = 0.3 (gentle)
iconSize: moderateScale(24)           // factor = 0.5 (default)
```

| Device          | `moderateScale(24)` | vs linear `scale(24)` |
| --------------- | ------------------- | --------------------- |
| iPhone SE       | 23px                | 22px                  |
| iPhone 14       | 24px (base)         | 24px (base)           |
| iPhone 15 PM    | 24px                | 25px                  |
| iPad Mini       | 34px                | 43px                  |
| iPad Pro 12.9"  | 42px                | **59px** (too big!)   |

---

### 4. `moderateVerticalScale(size, factor?)`

**Dampened vertical scaling** — same concept as `moderateScale` but based on screen **height** instead of width.

```tsx
import { moderateVerticalScale } from "src/utils/functions/dimensions";

// Examples
height: moderateVerticalScale(80)   // tab bar height
height: moderateVerticalScale(43)   // tab item height
minHeight: moderateVerticalScale(70)
```

---

### 5. `SCREEN_WIDTH` & `SCREEN_HEIGHT`

Raw device dimensions — use when you need the actual screen size for calculations.

```tsx
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "src/utils/functions/dimensions";

const CARD_WIDTH = (SCREEN_WIDTH - scale(20) * 3) / 2;
```

---

## Which Function to Use Where

### Quick Decision Table

| CSS Property                              | Function                      | Why                                       |
| ----------------------------------------- | ----------------------------- | ----------------------------------------- |
| `paddingHorizontal`, `px`, `marginLeft`   | `scale()`                     | Follows screen width                      |
| `paddingVertical`, `py`, `mt`, `mb`       | `verticalScale()`             | Follows screen height                     |
| `fontSize`                                | `moderateScale()`             | Must NOT double on tablets                |
| `icon size`                               | `moderateScale()`             | Must NOT double on tablets                |
| `borderRadius`                            | `moderateScale(size, 0.3)`    | Barely needs to change                    |
| `borderWidth`                             | `moderateScale(size, 0.3)`    | Barely needs to change                    |
| `avatar / thumbnail width & height`       | `moderateScale()`             | Fixed-size element, shouldn't blow up     |
| `component height` (tab bar, input, etc.) | `moderateVerticalScale()`     | Height-based + dampened                   |
| `horizontal gap`                          | `scale()`                     | Follows width                             |
| `vertical gap`                            | `verticalScale()`             | Follows height                            |
| `button height` / `input height`          | `moderateScale()`             | Fixed-size element                        |

---

## Full Real-World Examples

### Header Component

```tsx
import { scale, moderateScale } from "src/utils/functions/dimensions";

<XStack
  px={scale(20)}                          // horizontal padding → scale
  pt={moderateScale(8)}                   // small vertical padding → moderateScale (ok too)
  pb={moderateScale(12)}                  // small vertical padding
>
  <MyText
    fontSize={moderateScale(24)}          // font → moderateScale
    fontWeight="600"
  >
    Pakhi Tunes
  </MyText>

  <Button
    rounded={moderateScale(20)}           // border radius → moderateScale (gentle)
    px={scale(12)}                        // horizontal padding → scale
    py={moderateScale(8)}                 // small vertical padding
  >
    <MyText fontSize={moderateScale(12)}>  {/* font → moderateScale */}
      FREE MUSIC
    </MyText>
  </Button>

  <Bell size={moderateScale(22)} />       {/* icon → moderateScale */}
</XStack>
```

### Search Bar

```tsx
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";

<XStack
  px={scale(20)}                          // horizontal padding → scale
  py={verticalScale(10)}                  // vertical padding → verticalScale
>
  <XStack
    rounded={moderateScale(16)}           // border radius → moderateScale
    px={scale(16)}                        // horizontal padding → scale
    height={moderateScale(48)}            // component height → moderateScale
    gap={scale(12)}                       // horizontal gap → scale
  >
    <Search size={moderateScale(20)} />   {/* icon → moderateScale */}
    <Input fontSize={moderateScale(16)} /> {/* font → moderateScale */}
    <Mic size={moderateScale(20)} />      {/* icon → moderateScale */}
  </XStack>
</XStack>
```

### Music List Item

```tsx
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";

<XStack gap={scale(12)}>                  {/* horizontal gap → scale */}
  <Image
    style={{
      width: moderateScale(56),           // thumbnail → moderateScale
      height: moderateScale(56),          // thumbnail → moderateScale
      borderRadius: moderateScale(8),     // border radius → moderateScale
    }}
  />
  <YStack>
    <MyText fontSize={moderateScale(16)}> {/* font → moderateScale */}
      Artist Name
    </MyText>
    <MyText fontSize={moderateScale(14)}> {/* font → moderateScale */}
      Song Name
    </MyText>
  </YStack>
  <XStack
    width={moderateScale(40)}             // button size → moderateScale
    height={moderateScale(40)}            // button size → moderateScale
    borderRadius={moderateScale(20)}      // border radius → moderateScale
    borderWidth={1}                       // 1px border doesn't need scaling
  >
    <Download size={moderateScale(20)} /> {/* icon → moderateScale */}
  </XStack>
</XStack>
```

### Tab Bar

```tsx
import { scale, moderateScale, moderateVerticalScale } from "src/utils/functions/dimensions";

const styles = StyleSheet.create({
  container: {
    height: moderateVerticalScale(80),        // tab bar height → moderateVerticalScale
    borderTopLeftRadius: moderateScale(30),    // border radius → moderateScale
    borderTopRightRadius: moderateScale(30),
    paddingHorizontal: scale(10),             // horizontal padding → scale
  },
  tabItem: {
    height: moderateVerticalScale(43),        // tab item height → moderateVerticalScale
    borderRadius: moderateScale(30),          // border radius → moderateScale
  },
  text: {
    marginLeft: scale(8),                     // horizontal spacing → scale
    fontSize: moderateScale(14),              // font → moderateScale
  },
});

// Icons
const iconSize = moderateScale(20);           // icon → moderateScale
```

### Login Page (form with inputs)

```tsx
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";

<YStack
  px={scale(25)}                               // horizontal padding → scale
  py={verticalScale(60)}                       // vertical padding → verticalScale
>
  <MyText fontSize={moderateScale(100)}>       {/* large display font → moderateScale */}
    S
  </MyText>
  <MyText fontSize={moderateScale(60)}>        {/* title font → moderateScale */}
    Pakhi Tunes
  </MyText>

  <Form mt={verticalScale(60)}>                {/* vertical margin → verticalScale */}
    <YStack gap={verticalScale(10)}>           {/* vertical gap → verticalScale */}
      <MyText fontSize={moderateScale(16)}>    {/* label font → moderateScale */}
        Email Address
      </MyText>
      <Input
        height={moderateScale(50)}             // input height → moderateScale
        rounded={moderateScale(8)}             // border radius → moderateScale
        borderWidth={moderateScale(1.5, 0.3)}  // border width → moderateScale (gentle)
        fontSize={moderateScale(14)}           // input font → moderateScale
      />
    </YStack>
  </Form>
</YStack>
```

---

## The `factor` Parameter Explained

The second argument in `moderateScale(size, factor)` controls how aggressively the value scales:

```
moderateScale(24, 0)   → always 24        (no scaling)
moderateScale(24, 0.3) → 21–31 range      (gentle — good for borderRadius, borderWidth)
moderateScale(24, 0.5) → 23–42 range      (default — good for fonts, icons, components)
moderateScale(24, 0.8) → 22–52 range      (aggressive — close to linear)
moderateScale(24, 1.0) → same as scale(24) (full linear — same as scale())
```

### Recommended Factors

| Use Case                | Factor  |
| ----------------------- | ------- |
| `borderWidth`           | `0.3`   |
| `borderRadius`          | `0.3`   |
| `fontSize`              | `0.5`   |
| `icon size`             | `0.5`   |
| `avatar / thumbnail`    | `0.5`   |
| `input / button height` | `0.5`   |
| `large display text`    | `0.5`   |

---

## Common Mistakes to Avoid

### 1. Using `scale()` for font sizes

```tsx
// BAD — font becomes 59px on iPad Pro
fontSize: scale(24)

// GOOD — font becomes 42px on iPad Pro (controlled)
fontSize: moderateScale(24)
```

### 2. Using `scale()` for vertical spacing

```tsx
// BAD — uses width ratio for vertical spacing
marginTop: scale(60)

// GOOD — uses height ratio
marginTop: verticalScale(60)
```

### 3. Not scaling at all

```tsx
// BAD — looks fine on your phone, tiny on tablets
fontSize: 16

// GOOD — adapts to all screens
fontSize: moderateScale(16)
```

### 4. Over-scaling border widths

```tsx
// BAD — 1.5px border becomes 3px on iPad
borderWidth: moderateScale(1.5)

// GOOD — barely scales (factor 0.3)
borderWidth: moderateScale(1.5, 0.3)
```

### 5. Scaling things that don't need it

```tsx
// DON'T scale these:
flex: 1              // flex ratios are already relative
width: "100%"        // percentages are already relative
borderWidth: 1       // 1px borders look fine everywhere
opacity: 0.7         // multipliers don't need scaling
```

---

## Import Shortcuts

```tsx
// Import only what you need
import { scale } from "src/utils/functions/dimensions";
import { scale, moderateScale } from "src/utils/functions/dimensions";
import { scale, verticalScale, moderateScale } from "src/utils/functions/dimensions";
import { scale, verticalScale, moderateScale, moderateVerticalScale } from "src/utils/functions/dimensions";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "src/utils/functions/dimensions";
```

---

## Device Reference Table

| Device              | Width  | Height | Width Ratio | Height Ratio |
| ------------------- | ------ | ------ | ----------- | ------------ |
| iPhone SE (3rd gen) | 375px  | 667px  | 0.91x       | 0.79x        |
| iPhone 14           | 390px  | 844px  | 0.94x       | 1.00x        |
| iPhone 14 (base)    | 414px  | 844px  | 1.00x       | 1.00x        |
| iPhone 14 Pro       | 393px  | 852px  | 0.95x       | 1.01x        |
| iPhone 15 Pro Max   | 430px  | 932px  | 1.04x       | 1.10x        |
| iPad Mini (6th gen) | 744px  | 1133px | 1.80x       | 1.34x        |
| iPad Air (5th gen)  | 820px  | 1180px | 1.98x       | 1.40x        |
| iPad Pro 11"        | 834px  | 1194px | 2.01x       | 1.41x        |
| iPad Pro 12.9"      | 1024px | 1366px | 2.47x       | 1.62x        |
