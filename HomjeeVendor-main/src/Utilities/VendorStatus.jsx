// Mirrors the backend threshold in helpers/vendorStatus.js. Kept as a
// constant here so the FE can fall back when the vendor object is from
// stale local-storage and doesn't yet carry status/statusLabel/statusColor.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LOW_COINS_THRESHOLD = 100;

// Resolves the four-state status from whatever the context happens to
// have. Prefers backend-provided fields; computes locally if absent.
const resolveStatus = vendor => {
  if (!vendor) return null;

  // Backend (preferred): status + statusLabel + statusColor.
  if (vendor.status) {
    return {
      key: vendor.status,
      label:
        vendor.statusLabel ||
        (vendor.status === 'archived'
          ? 'Archived'
          : vendor.status === 'low_coins'
          ? 'Low Coins'
          : vendor.status === 'team_unavailable'
          ? 'Team Unavailable'
          : 'Live'),
      color:
        vendor.statusColor ||
        (vendor.status === 'archived'
          ? '#dc3545'
          : vendor.status === 'low_coins'
          ? '#fd7e14'
          : vendor.status === 'team_unavailable'
          ? '#ffc107'
          : '#28a745'),
    };
  }

  // Fallback for cached data: archived → low_coins → live. The vendor app
  // can't compute team_unavailable without the booking list, but it'll
  // pick that up on the next API refresh.
  if (vendor.isArchived === true) {
    return { key: 'archived', label: 'Archived', color: '#dc3545' };
  }
  const coins = Number(vendor?.wallet?.coins || 0);
  if (coins < LOW_COINS_THRESHOLD) {
    return { key: 'low_coins', label: 'Low Coins', color: '#fd7e14' };
  }
  return { key: 'live', label: 'Live', color: '#28a745' };
};

const styles = StyleSheet.create({
  //   statusText: {
  //     fontSize: 12,
  //     fontWeight: '600',
  //     paddingHorizontal: 8,
  //     paddingVertical: 4,
  //     borderRadius: 4,
  //     overflow: 'hidden',
  //   },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

const StatusBadge = ({ vendor }) => {
  const status = resolveStatus(vendor);
  if (!status) return null;
  return (
    <View>
      <Text style={[styles.statusText, { color: status.color }]}>
        {status.label}
      </Text>
    </View>
  );
};
export { StatusBadge };
