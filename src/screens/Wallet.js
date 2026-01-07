import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  setModalVisible,
} from 'react-native';
import React from 'react';

const Wallet = ({navigation}) => {
  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Payment');
            // Add confirm logic here if needed
          }}>
          <Image
            style={{margin: 10}}
            source={require('../assets/images/group.png')} // Update path if needed
          />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: 'Poppins-SemiBold',
            fontSize: 16,
            color: '#000000',
            margin: 10,
          }}>
          Transactions
        </Text>
        <View style={styles.mainleadone}>
          <View style={styles.leadone}></View>

          <View style={styles.location}>
            <Image
              style={styles.locationicon}
              source={require('../assets/icons/circleyellow.png')} // Update path if needed
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 12,
                color: '#000000',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 120,
              }}>
              Recharged Wallet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#008E00',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 50,
              }}>
              +100 coins
            </Text>
          </View>

          <Text
            style={{
              marginLeft: 30,
              color: '#000000',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 12,
            }}>
            05/02/2025
          </Text>
        </View>
        <View style={styles.mainleadone}>
          <View style={styles.leadone}></View>

          <View style={styles.location}>
            <Image
              style={styles.locationicon}
              source={require('../assets/icons/circleyellow.png')} // Update path if needed
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 12,
                color: '#000000',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 120,
              }}>
              Recharged Wallet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: 'red',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 50,
              }}>
              -10 coins
            </Text>
          </View>

          <Text
            style={{
              marginLeft: 30,
              color: '#000000',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 12,
            }}>
            05/02/2025
          </Text>
        </View>
        <View style={styles.mainleadone}>
          <View style={styles.leadone}></View>

          <View style={styles.location}>
            <Image
              style={styles.locationicon}
              source={require('../assets/icons/circleyellow.png')} // Update path if needed
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 12,
                color: '#000000',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 120,
              }}>
              Recharged Wallet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#008E00',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 50,
              }}>
              +100 coins
            </Text>
          </View>

          <Text
            style={{
              marginLeft: 30,
              color: '#000000',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 12,
            }}>
            05/02/2025
          </Text>
        </View>
        <View style={styles.mainleadone}>
          <View style={styles.leadone}></View>

          <View style={styles.location}>
            <Image
              style={styles.locationicon}
              source={require('../assets/icons/circleyellow.png')} // Update path if needed
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 12,
                color: '#000000',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 120,
              }}>
              Recharged Wallet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#008E00',
                fontFamily: 'Poppins-SemiBold',
                marginRight: 50,
              }}>
              +100 coins
            </Text>
          </View>

          <Text
            style={{
              marginLeft: 30,
              color: '#000000',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 12,
            }}>
            05/02/2025
          </Text>
        </View>
      </ScrollView>
      <View style={styles.downborder} />
    </View>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingTop: 50,
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
    paddingHorizontal: 5,
    paddingTop: 3,
    paddingBottom: 3,
    marginLeft: 100,
  },
  icon: {
    width: 30,
    height: 20,

    left: -2,
  },
  iconsnewlead: {
    left: 5,
    top: -2,
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
    right: 5,
    bottom: 3,
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
    // top: 12,
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
    // padding: 10,
    margin: 5,
  },
  mainleadone: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 20,
    borderRadius: 5,
    margin: 10,
  },
  mainleadtwo: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 40,
    borderRadius: 10,
  },
  mainleadthree: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 60,
    borderRadius: 10,
  },
  mainleadfour: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 80,
    borderRadius: 10,
  },
  mainleadfive: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 20,
    top: 100,
    borderRadius: 10,
    marginBottom: 80,
  },
  downborder: {
    position: 'relative',
    // bottom: -250,
    left: 100,
    right: 20,
    borderBottomWidth: 5, // Increased thickness for visibility
    borderBottomColor: '#ED1F24', // Set to red as requested
    width: '40%',
    justifyContent: 'center',
    borderRadius: 20,
    top: 35,

    // Span the full width
  },
});

export default Wallet;
