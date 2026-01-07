// QuotesView.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const rupee = n => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;

const SAMPLE_QUOTE = {
  client: 'Test Lead',
  projectDurationDays: 10,
  metrics: { interiorArea: 1110, exteriorArea: 150 },
  totals: { totalCost: 143564, interiorCost: 115000, exteriorCost: 28564 },
  interiorSections: [
    {
      title: 'Living Room',
      items: [
        {
          name: 'Tractor Emulsion Fresh Paint',
          meta: 'Ceiling (Single)',
          price: 18652,
        },
        { name: 'Oil Luster Fresh Paint', meta: 'Wall (Single)', price: 4352 },
      ],
    },
    {
      title: 'Kitchen',
      items: [
        {
          name: 'Tractor Emulsion Fresh Paint',
          meta: 'Ceiling (Single)',
          price: 14489,
        },
        { name: 'Oil Luster Fresh Paint', meta: 'Wall (Single)', price: 4248 },
      ],
    },
    {
      title: 'Passage',
      items: [
        {
          name: 'Tractor Emulsion Fresh Paint',
          meta: 'Ceiling (Single)',
          price: 5922,
        },
      ],
    },
    {
      title: 'Bedroom 1',
      items: [
        {
          name: 'Tractor Emulsion Fresh Paint',
          meta: 'Ceiling (Single)',
          price: 7304,
        },
        { name: 'Oil Luster Fresh Paint', meta: 'Wall (Single)', price: 9359 },
      ],
    },
  ],
  exteriorSummary: [
    { label: 'Exterior Apex Regular', value: 20360 },
    { label: 'Discount', value: 0 },
    { label: 'GST (18%)', value: 7566 },
  ],
  exteriorFinal: 110564,
};

const Row = ({ left, right, bold, small, dim }) => (
  <View style={styles.row}>
    <Text
      style={[
        styles.rowLeft,
        bold && styles.bold,
        small && styles.small,
        dim && styles.dim,
      ]}
    >
      {left}
    </Text>
    <Text style={[styles.rowRight, bold && styles.bold, small && styles.small]}>
      {right}
    </Text>
  </View>
);

const SectionHeader = ({ children }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{children}</Text>
  </View>
);

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export default function QuotesView({ quote = SAMPLE_QUOTE }) {
  const {
    client,
    projectDurationDays,
    metrics,
    totals,
    interiorSections,
    exteriorSummary,
    exteriorFinal,
  } = quote;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top Greeting */}
      <Text style={styles.brand}>Homjee</Text>
      <Text style={styles.hi}>Hi {client},</Text>
      <Text style={styles.sub}>
        Here’s a quote for your painting work by Homjee—based on site inspection
        and measurements. For questions, reply to this email.
      </Text>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.kicker}>QUOTE</Text>
          <Text style={styles.total}>{rupee(totals.totalCost)}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Interior</Text>
              <Text style={styles.metricValue}>
                {metrics.interiorArea} sqft
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Exterior</Text>
              <Text style={styles.metricValue}>
                {metrics.exteriorArea} sqft
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Project Duration: {projectDurationDays} Days
              </Text>
            </View>
          </View>
        </Card>

        <Card style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.kicker, { marginBottom: 6 }]}>
            Homjee Guarantee
          </Text>
          <Text style={styles.bullet}>• Accurate area measurement</Text>
          <Text style={styles.bullet}>• Genuine, best-quality paints</Text>
          <Text style={styles.bullet}>• Dedicated project manager</Text>
          <Text style={styles.bullet}>• Mess-free, on-time completion</Text>
          <Text style={styles.bullet}>• 6 months service warranty</Text>
        </Card>
      </View>

      {/* Room-wise Painting Cost */}
      <Card>
        <Text style={styles.cardTitle}>Room-wise Painting Cost</Text>

        <SectionHeader>For Interior</SectionHeader>

        {interiorSections.map((sec, idx) => (
          <View key={sec.title} style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>{sec.title}</Text>
              {/* sample section total (sum) */}
              <Text style={styles.blockAmt}>
                {rupee(sec.items.reduce((a, b) => a + (b.price || 0), 0))}
              </Text>
            </View>

            {sec.items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <Row left={it.name} right={rupee(it.price)} bold />
                {!!it.meta && (
                  <Row left={`• ${it.meta}`} right={''} small dim />
                )}
                {i !== sec.items.length - 1 && <View style={styles.hr} />}
              </View>
            ))}

            {idx !== interiorSections.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}

        {/* Exterior Summary */}
        <SectionHeader>For Exterior</SectionHeader>
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          <Row
            left="Exterior Apex Regular"
            right={rupee(exteriorSummary[0].value)}
            bold
          />
          <Row left="Discount" right={rupee(exteriorSummary[1].value)} />
          <Row
            left="GST (as applicable)"
            right={rupee(exteriorSummary[2].value)}
          />
          <View style={styles.hrThick} />
          <Row left="Final Cost" right={rupee(exteriorFinal)} bold />
          <Text style={[styles.small, styles.dim, { marginTop: 6 }]}>
            *All measurements are taken by laser device.
          </Text>
        </View>
      </Card>

      {/* stop right before “Why Choose Homjee” */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

/* -------------------- styles -------------------- */
const BLUE = '#eaf3ff';
const BORDER = '#cfe0fb';
const INK = '#0b2347';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f8ff' },
  content: { padding: 12, paddingBottom: 32 },

  brand: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: INK,
    marginBottom: 4,
  },
  hi: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: INK,
    marginBottom: 4,
  },
  sub: {
    color: '#3f547a',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },

  summaryRow: { flexDirection: 'row', marginBottom: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    elevation: 1,
  },
  kicker: {
    color: '#6b86b8',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  total: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: INK,
    marginBottom: 8,
  },

  metricsRow: { flexDirection: 'row', gap: 12 },
  metric: { backgroundColor: BLUE, padding: 8, borderRadius: 8, flex: 1 },
  metricLabel: {
    color: '#5f76a8',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  metricValue: { color: INK, fontSize: 14, fontFamily: 'Poppins-SemiBold' },

  badgeRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    backgroundColor: BLUE,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  badgeText: { color: INK, fontSize: 12, fontFamily: 'Poppins-Medium' },
  bullet: { color: INK, fontSize: 12, fontFamily: 'Poppins-Medium' },

  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: INK,
    marginBottom: 8,
  },

  sectionHeader: {
    backgroundColor: BLUE,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 8,
  },
  sectionHeaderText: { fontFamily: 'Poppins-Bold', color: INK },

  block: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#fff',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  blockTitle: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: INK },
  blockAmt: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: INK },

  itemRow: { paddingHorizontal: 12, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLeft: { color: INK, flex: 1, paddingRight: 8 },
  rowRight: { color: INK, fontFamily: 'Poppins-Medium' },

  bold: { fontFamily: 'Poppins-SemiBold' },
  small: { fontSize: 12 },
  dim: { color: '#6480ad', fontFamily: 'Poppins-Medium' },

  hr: { height: 1, backgroundColor: '#eef2fb', marginTop: 8 },
  hrThick: { height: 1.5, backgroundColor: BORDER, marginVertical: 10 },
  divider: { height: 10, backgroundColor: 'transparent' },
});
