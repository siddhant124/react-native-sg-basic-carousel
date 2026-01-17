/* eslint-disable react-native/no-inline-styles */
import { useState, useRef, useEffect, JSX } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";

interface CarouselProps {
  data: any[]; // Array of items with flexible structure but image is mandatory
  renderItem?: (item: any) => JSX.Element; // Custom renderer
  autoScroll?: boolean;
  scrollInterval?: number;
  showPagination?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  paginationContainerStyle?: StyleProp<ViewStyle>;
  paginationDotStyle?: StyleProp<ViewStyle>;
}

const { width: screenWidth } = Dimensions.get("window");

const BasicCarousel = ({
  data,
  renderItem,
  autoScroll = true,
  scrollInterval = 3000,
  showPagination = true,
  containerStyle,
  paginationContainerStyle,
  paginationDotStyle,
}: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    if (autoScroll) {
      const timerId = setInterval(() => {
        if (activeIndex === data.length - 1) {
          setActiveIndex(0);
          flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        } else {
          setActiveIndex(activeIndex + 1);
          flatListRef.current?.scrollToIndex({
            index: activeIndex + 1,
            animated: true,
          });
        }
      }, scrollInterval);

      return () => clearInterval(timerId);
    }
  }, [activeIndex, autoScroll, scrollInterval, data.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  return (
    <View style={containerStyle}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) =>
          renderItem ? renderItem(item) : <DefaultCarouselCard item={item} />
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        scrollEventThrottle={16}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, index) => index.toString()}
      />

      {showPagination && (
        <View style={[styles.paginationContainer, paginationContainerStyle]}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                paginationDotStyle,
                {
                  width: index === activeIndex ? 20 : 8,
                  opacity: index === activeIndex ? 1 : 0.5,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Default Carousel Card: Used if no custom renderer is provided
const DefaultCarouselCard = ({ item }: { item: any }) => {
  return (
    <View style={styles.defaultCard}>
      <View style={styles.imageBackground} />
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  paginationDot: {
    height: 8,
    backgroundColor: "#2196F3",
    marginHorizontal: 4,
    borderRadius: 4,
  },
  defaultCard: {
    width: screenWidth * 0.9,
    height: 200,
    marginHorizontal: screenWidth * 0.05,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 1,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  imageBackground: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    height: "100%",
    backgroundColor: "red",
  },
});

export default BasicCarousel;
