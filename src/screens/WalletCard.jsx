import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function WalletCard({ coins = 1000, onBuyCoins = () => {} }) {
  const coinText = Number(coins || 0).toLocaleString('en-IN');

  return (
    <View style={styles.card}>
      {/* subtle highlight shape */}
      <View style={styles.highlight} />

      <View style={styles.row}>
        {/* Coin icon circle */}
        <View style={styles.coinCircle}>
          {/* If you have a coin icon asset, use it here */}
          {/* <Image source={require("../assets/icons/coin.png")} style={styles.coinImg} /> */}
          <Text style={styles.coinSymbol}>₹</Text>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.title}>Your Coin Balance</Text>
          <Text style={styles.coins}>{coinText}</Text>
        </View>
      </View>

      {/* Bottom white button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onBuyCoins}
        style={styles.buyBtn}
      >
        <Text style={styles.buyBtnText}>Buy Coins</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6C10E', // yellow base
    borderRadius: 18,
    padding: 14,
    margin: 10,
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    minHeight: 110,
  },

  // simple geometric highlight (like your sample)
  highlight: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 28,
    transform: [{ rotate: '20deg' }],
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 30,
  },

  coinCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B3B3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  coinSymbol: {
    color: '#F6C10E',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },

  // If you use an image instead:
  coinImg: {
    width: 28,
    height: 28,
    tintColor: '#F6C10E',
  },

  textArea: {
    flex: 1,
  },

  title: {
    color: '#1A1A1A',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },

  coins: {
    marginTop: 4,
    color: '#111',
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
  },

  buyBtn: {
    marginTop: 14,
    backgroundColor: '#FFFFFF', // ✅ white background
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyBtnText: {
    color: '#111',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
