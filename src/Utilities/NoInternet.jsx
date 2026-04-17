import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';

const NoInternet = () => {
  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: '50%',
          width: 200,
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/images/unplugged.png')}
          style={{
            width: 150,
            height: 150,
          }}
        />
      </View>
      <Text style={styles.text}>Ooops!</Text>
      <Text style={styles.text1}>No internet connection found.</Text>
      <Text style={styles.text1}>Check your connection.</Text>
      <TouchableOpacity
        style={{
          marginTop: 10,
          backgroundColor: '#ff554f',
          paddingHorizontal: 70,
          paddingVertical: 15,
          borderRadius: 7,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: 'white',
            fontFamily: 'Poppins-Medium',
          }}
        >
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f5',
  },
  text: {
    fontSize: 28,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 15,
  },
  text1: { fontSize: 15, color: '#b0b0b2', fontFamily: 'Poppins-Medium' },
});

export default NoInternet;
