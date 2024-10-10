/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ImageBackground,
} from 'react-native';

// CarouselItem must have at least an image, but other fields can be dynamic
interface CarouselItem {
  image: string; // The image field is required
  [key: string]: any; // Other properties are flexible
}

interface CarouselProps {
  data: CarouselItem[]; // Array of items with flexible structure but image is mandatory
  renderItem?: (item: CarouselItem) => JSX.Element; // Custom renderer
  autoScroll?: boolean;
  scrollInterval?: number;
  showPagination?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  paginationContainerStyle?: StyleProp<ViewStyle>;
  paginationDotStyle?: StyleProp<ViewStyle>;
}

const {width: screenWidth} = Dimensions.get('window'); 

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
  const flatListRef = useRef<FlatList<CarouselItem>>(null);

  useEffect(() => {
    if (autoScroll) {
      const timerId = setInterval(() => {
        if (activeIndex === data.length - 1) {
          setActiveIndex(0);
          flatListRef.current?.scrollToIndex({index: 0, animated: true});
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
    ({viewableItems}: {viewableItems: any}) => {
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
        renderItem={({item}) =>
          renderItem ? renderItem(item) : <DefaultCarouselCard item={item} />
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        scrollEventThrottle={16}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
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
const DefaultCarouselCard = ({item}: {item: CarouselItem}) => {
  return (
    <View style={styles.defaultCard}>
      {/* Default card layout with the mandatory image field */}
      <ImageBackground
        source={{uri: item.image}}
        style={styles.imageBackground}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    height: 8,
    backgroundColor: '#2196F3',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  defaultCard: {
    width: screenWidth * 0.9,
    height: 200,
    marginHorizontal: screenWidth * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 1,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    height: '100%',
  },
});

export default BasicCarousel;
