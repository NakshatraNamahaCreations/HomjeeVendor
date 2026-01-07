import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../Utilities/ThemeContext';

const Money = ({ navigation }) => {
  const { deviceTheme } = useThemeColor();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <Header />
      <View style={{ padding: 10 }}>
        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            marginVertical: 10,
          }}
        >
          Money Dashboard
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {Array.from({ length: 15 }).map((_, idx) => (
            <View key={idx + 1} style={styles.mainleadone}>
              <View style={styles.leadone}></View>

              <View style={styles.location}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Poppins-SemiBold',
                    marginRight: 120,
                  }}
                >
                  Sonali K
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#008E00',
                    fontFamily: 'Poppins-SemiBold',
                    marginRight: 20,
                    marginTop: 15,
                  }}
                >
                  ₹ 3,637
                </Text>
              </View>

              <Text
                style={{
                  color: '#000000',
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 12,
                  marginLeft: 5,
                  marginTop: -20,
                }}
              >
                24th Feb 2025 . 11:00 AM
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    marginBottom: 100,
  },
  discoverleads: {
    margin: 10,
  },
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
  notificationWrapper: {
    position: 'relative',
  },
  notificationWrappertwo: {
    borderRadius: 28,
    borderWidth: 1,
    width: '22%',
    paddingHorizontal: 35,
    paddingTop: 3,
    paddingBottom: 3,
    marginLeft: 100,
  },
  icon: {
    width: 30,
    height: 20,
  },
  iconsnewlead: {
    left: 5,
    top: -2,
  },

  badge: {
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
    right: 5,
    bottom: 3,
    marginRight: 20,
  },
  title: {
    fontSize: 12,
    color: '#434343',
    // marginTop: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    padding: 30,
    marginLeft: -25,
    letterSpacing: 0,
    fontWeight: 500,
  },
  titles: {
    marginRight: 200,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0,
    right: 4,
  },
  headertwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: -20,
    marginBottom: -20,
  },
  newleads: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#636363',
    letterSpacing: 0,
    left: 3,
  },
  locationicon: {
    width: 20,
    height: 15,
    top: 12,
    paddingRight: 10,
    right: 10,
  },
  leadone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  mainleadone: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default Money;
