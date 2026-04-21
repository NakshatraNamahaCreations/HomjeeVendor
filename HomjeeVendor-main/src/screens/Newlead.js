import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';

const Newlead = () => {
  return (
    <View style={styles.safeArea}>
      {/* Header Row */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require('../assets/images/logo.png.png')} // Update path if needed
          resizeMode="contain"
        />
        <View style={styles.notificationWrappertwo}>
          <Image
            style={styles.icon}
            source={require('../assets/icons/wallet.png')} // Update path if needed
            resizeMode="contain"
          />
          <View style={styles.badgetwo}>
            <Text style={styles.badgeTexttwo}>100</Text>
          </View>
        </View>
        <View>
          <Image
            style={styles.icontwo}
            source={require('../assets/icons/bell.png')} // Update path if needed
            resizeMode="contain"
          />
          {/* <View style={styles.badge}>
               <Text style={styles.badgeText}>100</Text>
             </View> */}
        </View>
      </View>

      {/* <Text style={styles.title}>Discover today’s new leads!</Text> */}
      <View style={styles.headertwo}>
        <Image
          style={styles.icons}
          source={require('../assets/icons/Icon.png')} // Update path if needed
          resizeMode="contain"
        />
        <Text style={styles.titles}>New Leads</Text>
        <View style={styles.notificationWrapper}></View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: 50,
    // paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  logo: {
    width: 100,
    height: 30,
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationWrappertwo: {
    borderRadius: 28,
    borderWidth: 1,
    width: '22%',
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 3,
    marginLeft: 50,
  },
  icon: {
    width: 30,
    height: 20,

    left: -2,
  },
  icontwo: {
    width: 35,
    height: 22,
    top: 3,
  },
  badge: {
    position: 'absolute',
    right: -10,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgetwo: {
    position: 'absolute',
    left: 40,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    top: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTexttwo: {
    color: '#ED1F24',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
export default Newlead;
