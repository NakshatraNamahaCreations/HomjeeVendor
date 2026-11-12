// DeepCleaningPackageDetails.js
// Renders the full "View Details" rich content for a Deep Cleaning package line
// item, matching the website pop-up: per-tier includes, the Classic/Premium/
// Ultimate comparison table, and the "What we clean / excluded / need" images.
// Picks the right variation (Furnished / Unfurnished / Book-by-room / Mini)
// from the booking's service item. Renders nothing for Mini services or for
// non-Deep-Cleaning items.

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  KIND,
  detectDeepCleaningInfo,
  getTierIncludes,
  getWhatWeCleanImages,
  tableTiers,
  FURNISHED_TABLE,
  UNFURNISHED_TABLE,
} from './deepCleaningContent';

const Mark = ({ on }) => (
  <Text style={[styles.mark, on ? styles.markOn : styles.markOff]}>
    {on ? '✓' : '✕'}
  </Text>
);

const ComparisonTable = ({ variant }) => {
  const furnished = variant !== 'unfurnished';
  const tiers = tableTiers(variant);
  const data = furnished ? FURNISHED_TABLE : UNFURNISHED_TABLE;

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cellLabel, styles.headerText]}>Services</Text>
        {tiers.map(t => (
          <Text key={t} style={[styles.cellFlag, styles.headerText]}>
            {t}
          </Text>
        ))}
      </View>

      {data.map(group => (
        <View key={group.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionText}>{group.section}</Text>
          </View>
          {group.rows.map(row => (
            <View key={row[0]} style={styles.row}>
              <Text style={styles.cellLabel}>{row[0]}</Text>
              {row.slice(1).map((v, i) => (
                <View key={i} style={styles.cellFlag}>
                  <Mark on={v === 1} />
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const TierIncludes = ({ variant, tier }) => {
  const items = getTierIncludes(variant, tier);
  if (!items.length) return null;
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.subHeading}>
        What's included{tier ? ` — ${tier}` : ''}
      </Text>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
};

// Full-width image sized by its own aspect ratio, so there are no fixed-height
// letterbox gaps and every section renders at the same width.
const RemoteImage = ({ uri }) => {
  const [ratio, setRatio] = React.useState(1.3);
  React.useEffect(() => {
    let active = true;
    Image.getSize(
      uri,
      (w, h) => {
        if (active && w && h) setRatio(w / h);
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [uri]);
  return (
    <Image
      source={{ uri }}
      style={{
        width: '100%',
        aspectRatio: ratio,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f4f4f4',
      }}
      resizeMode="cover"
    />
  );
};

// The images already carry their own headings ("What we clean", "Excludes",
// "What we need from you"), so no title is added here — that was showing each
// heading twice.
const ImageSection = ({ images }) => (
  <View style={{ marginTop: 12 }}>
    {images.map((im, i) => (
      <RemoteImage key={i} uri={im.src} />
    ))}
  </View>
);

const DeepCleaningPackageDetails = ({ service }) => {
  const info = detectDeepCleaningInfo(service || {});

  // Mini services & non-DC items: no rich content (matches the website).
  if (info.kind === KIND.NONE || info.kind === KIND.MINI) return null;

  if (info.kind === KIND.BOOK_BY_ROOM) {
    const imgs = getWhatWeCleanImages(undefined, info.room);
    return (
      <View style={styles.wrap}>
        <ImageSection images={imgs.clean} />
        <ImageSection images={[imgs.excludes]} />
        <ImageSection images={[imgs.need]} />
      </View>
    );
  }

  // Whole-home: Furnished / Unfurnished (apartment or bungalow).
  const imgs = getWhatWeCleanImages(info.variant);
  return (
    <View style={styles.wrap}>
      <TierIncludes variant={info.variant} tier={info.tier} />
      <Text style={[styles.subHeading, { marginTop: 14 }]}>Types of cleaning</Text>
      <ComparisonTable variant={info.variant} />
      <ImageSection images={imgs.clean} />
      <ImageSection images={[imgs.excludes]} />
      <ImageSection images={[imgs.need]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  subHeading: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  // bullets
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bulletDot: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ED1F24',
    marginRight: 6,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  // table
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: { backgroundColor: '#f7f7f7' },
  headerText: { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#333' },
  sectionRow: { backgroundColor: '#fafafa', paddingVertical: 8, paddingHorizontal: 8 },
  sectionText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: '#333' },
  cellLabel: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#444',
  },
  cellFlag: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    textAlign: 'center',
  },
  mark: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  markOn: { color: '#1BA672' },
  markOff: { color: '#c4c4c4' },
});

export default DeepCleaningPackageDetails;
