import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Smooth, continuous rotation like Tesla app
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000, // 20 seconds for full rotation
        easing: Easing.linear,
      }),
      -1, // Infinite loop
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateY: `${rotation.value}deg` },
        { perspective: 1000 },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Animated House */}
      <View style={styles.imageContainer}>
        <Animated.View style={animatedStyle}>
          <Image
            source={require('../../assets/house.png')}
            style={styles.houseImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity style={styles.textButton}>
          <Text style={styles.textButtonLabel}>Create Account</Text>
        </TouchableOpacity>

        {/* Continue as Guest Button */}
        <TouchableOpacity style={styles.textButton}>
          <Text style={styles.textButtonLabel}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  houseImage: {
    width: width * 0.8,
    height: height * 0.4,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 60,
    gap: 18,
  },
  signInButton: {
    backgroundColor: '#4A7BF7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4A7BF7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  textButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  textButtonLabel: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});
