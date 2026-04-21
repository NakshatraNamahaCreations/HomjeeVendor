import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';

export default function ResponseLoader() {
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -20,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ]),
    );
    bounce.start();
    return () => {
      bounce.stop();
      // slide.stop();
    };
  }, [bounceValue]);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          {
            width: 50,
            height: 50,
            backgroundColor: 'white',
            borderRadius: 50,
            transform: [{ translateY: bounceValue }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
});
