import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useVendorContext } from '../Utilities/VendorContext';

const Header = () => {
  const navigation = useNavigation();
  const { vendorDataContext } = useVendorContext();
  const amount = Number(
    (vendorDataContext &&
      vendorDataContext.wallet &&
      vendorDataContext?.wallet?.coins) ||
    0,
  );

  return (
    <View>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require('../assets/images/logo.png.png')}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <View style={styles.notificationWrappertwo}>
            <Image
              style={{ marginLeft: -25 }}
              source={require('../assets/icons/wallet.png')}
              resizeMode="contain"
            />
            <View style={styles.badgetwo}>
              <Text style={styles.badgeTexttwo}>{amount}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
          <Image
            style={{ width: 35, height: 22, top: 3 }}
            source={require('../assets/icons/bell.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 30,
  },
  notificationWrappertwo: {
    borderRadius: 28,
    borderWidth: 1,
    width: '22%',
    paddingHorizontal: 35,
    paddingVertical: 5,
    marginLeft: 100,
  },
  badgetwo: {
    position: 'absolute',
    left: 40,
    top: 5,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeTexttwo: {
    color: '#ED1F24',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: -5,
  },
});

export default Header;
