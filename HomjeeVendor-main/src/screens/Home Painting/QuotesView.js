import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  BackHandler,
  Pressable,
} from 'react-native';
import { useLeadContext } from '../../Utilities/LeadContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getRequest } from '../../ApiService/apiHelper';
import { API_ENDPOINTS } from '../../ApiService/apiConstants';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// ✅ optional: replace with your logo
const LOGO_URI = '../../logo.png.png';

export default function QuotesView() {
  const { leadDataContext } = useLeadContext();
  const route = useRoute();
  const leadId = leadDataContext._id;
  const { quoteId } = route.params;
  const [quotes, setQuotes] = useState({});
  const [measurementData, setMeasurementData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.navigate('Quotes');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GET_QUOTATION_BY_QUOTE_ID}${quoteId}`,
      );
      if (response) {
        setQuotes(response.quote);
      } else {
        setQuotes({});
      }
    } catch (err) {
      console.log('Error fetching Quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quoteId]);

  const fetchMeasurements = async () => {
    setLoading(true);

    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GET_MEASUREMENTS_BY_LEADID}${leadId}`,
      );
      if (response) {
        setMeasurementData(response);
      } else {
        setMeasurementData(null);
      }
    } catch (err) {
      console.log('Error fetching Measurement Data:', err);
      setMeasurementData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [leadId]);

  // =========================
  // ✅ Safe formatters
  // =========================
  const rupee = val => {
    try {
      const num = Number(val);
      if (!Number.isFinite(num)) return '—';
      return `₹ ${num.toLocaleString('en-IN')}`;
    } catch (e) {
      return '—';
    }
  };

  const safeText = (v, fallback = '—') => {
    try {
      const s = String(v ?? '').trim();
      return s.length ? s : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const getDayLabel = days => {
    try {
      const d = Number(days ?? 0);
      if (!Number.isFinite(d) || d <= 0) return '—';
      return `${d} ${d === 1 ? 'Day' : 'Days'}`;
    } catch (e) {
      return '—';
    }
  };

  // =========================
  // ✅ Derived UI data
  // =========================
  const header = useMemo(() => {
    try {
      const customerName = leadDataContext?.customer?.name;
      const phone = leadDataContext?.customer?.phone;
      const address =
        [
          leadDataContext?.address?.houseFlatNumber,
          leadDataContext?.address?.streetArea,
          leadDataContext?.address?.city,
        ]
          .filter(Boolean)
          .join(', ') || '—';

      const vendorName = leadDataContext?.assignedProfessional?.name;
      const vendorPhone = leadDataContext?.assignedProfessional?.phone;

      return { customerName, phone, address, vendorName, vendorPhone };
    } catch (e) {
      return {};
    }
  }, [leadDataContext]);

  const totals = useMemo(() => {
    try {
      const t = quotes?.totals || {};
      return {
        interior: Number(t?.interior ?? 0),
        exterior: Number(t?.exterior ?? 0),
        others: Number(t?.others ?? 0),
        subtotal: Number(t?.subtotal ?? 0),
        discountAmount: Number(t?.discountAmount ?? 0),
        grandTotal: Number(t?.grandTotal ?? 0),
        discount: quotes.discount,
      };
    } catch (e) {
      return {
        interior: 0,
        exterior: 0,
        others: 0,
        subtotal: 0,
        discountAmount: 0,
        grandTotal: 0,
      };
    }
  }, [quotes]);

  console.log('totals', totals);
  console.log(' totals.discount', totals.discount?.amount);

  const modeLabel = mode => {
    try {
      const m = String(mode || '').toUpperCase();
      if (m === 'REPAINT') return 'Repaint With Primer';
      if (m === 'FRESH') return 'Fresh Paint';
      if (m === 'WHITEWASH') return 'Whitewash';
      return m || '—';
    } catch (e) {
      return '—';
    }
  };

  const getCountFromMeasurement = (measurementData, roomName, type, mode) => {
    try {
      const room = measurementData?.rooms?.[roomName];
      if (!room) return 0;

      const m = String(mode || '').toUpperCase();
      const t = String(type || '').toLowerCase();

      if (t.includes('ceiling')) {
        const arr = Array.isArray(room?.ceilings) ? room.ceilings : [];
        return arr.filter(x => String(x?.mode || '').toUpperCase() === m)
          .length;
      }

      if (t.includes('wall')) {
        const arr = Array.isArray(room?.walls) ? room.walls : [];
        return arr.filter(x => String(x?.mode || '').toUpperCase() === m)
          .length;
      }

      // for Doors/Grills etc
      if (t.includes('measurement')) {
        const arr = Array.isArray(room?.measurements) ? room.measurements : [];
        return arr.filter(x => String(x?.mode || '').toUpperCase() === m)
          .length;
      }

      return 0;
    } catch (e) {
      return 0;
    }
  };

  const roomWise = useMemo(() => {
    try {
      const lines = Array.isArray(quotes?.lines) ? quotes.lines : [];
      const bySection = { Interior: [], Exterior: [], Others: [] };

      // ordering: Ceiling first, then Wall, then Measurement
      const weightType = t => {
        const x = String(t || '').toLowerCase();
        if (x.includes('ceiling')) return 1;
        if (x.includes('wall')) return 2;
        if (x.includes('measurement')) return 3;
        return 9;
      };

      for (const ln of lines) {
        const sectionType = ln?.sectionType || 'Others';
        const roomName = ln?.roomName || 'Room';

        // ✅ MERGE like reference: paintName + type + mode
        const bd = Array.isArray(ln?.breakdown) ? ln.breakdown : [];
        const map = new Map();

        for (const b of bd) {
          const sqft = Number(b?.sqft ?? 0);
          const price = Number(b?.price ?? 0);

          // optional: hide zero sqft rows (your Entrance Passage ceiling had 0)
          // if (sqft <= 0) continue;

          const paintName = b?.paintName || 'Paint';
          const type = b?.type || '';
          const mode = b?.mode || '';

          const key = `${paintName}__${type}__${mode}`;
          const prev = map.get(key);

          if (!prev) {
            map.set(key, {
              paintName,
              type,
              mode,
              sqft,
              price,
              unitPrice: Number(b?.unitPrice ?? 0),
              count: getCountFromMeasurement(
                measurementData,
                roomName,
                type,
                mode,
              ),
            });
          } else {
            prev.sqft += sqft;
            prev.price += price;
            prev.sub = `${prev.type} (${Math.round(prev.sqft)} sqft)`;
            // keep count from measurement (does not change)
            map.set(key, prev);
          }
        }

        const paintRows = Array.from(map.values()).sort((a, b) => {
          const wa = weightType(a.type);
          const wb = weightType(b.type);
          if (wa !== wb) return wa - wb;

          // repaint rows first or fresh rows first? (reference shows repaint first sometimes)
          const ma = String(a.mode || '').toUpperCase();
          const mb = String(b.mode || '').toUpperCase();
          if (ma !== mb) return ma.localeCompare(mb);

          return String(a.paintName || '').localeCompare(
            String(b.paintName || ''),
          );
        });

        // ✅ additional services (Waterproofing/Textures) AFTER paints in same room
        const add = Array.isArray(ln?.additionalServices)
          ? ln.additionalServices
          : [];
        const additionalItems = add.map(x => ({
          serviceType: x?.serviceType || 'Additional Service',
          materialName: x?.customName?.trim() ? x.customName : x?.materialName,
          surfaceType: x?.surfaceType || '',
          areaSqft: Number(x?.areaSqft ?? 0),
          unitPrice: Number(x?.unitPrice ?? 0),
          total: Number(x?.total ?? 0),
        }));

        const paintSubtotal = Number(ln?.subtotal ?? 0);
        const additionalTotal = Number(ln?.additionalTotal ?? 0);

        const roomRow = {
          roomName,
          subtotal: paintSubtotal + additionalTotal,
          paintRows,
          additionalItems,
          additionalTotal: Number(ln?.additionalTotal ?? 0),
        };

        if (!bySection[sectionType]) bySection[sectionType] = [];
        bySection[sectionType].push(roomRow);
      }

      return bySection;
    } catch (e) {
      return { Interior: [], Exterior: [], Others: [] };
    }
  }, [quotes, measurementData]);

  // Service-wise table (flat merged list)
  const serviceWise = useMemo(() => {
    try {
      const lines = Array.isArray(quotes?.lines) ? quotes.lines : [];
      const paintMap = new Map();
      const addMap = new Map();

      // ✅ merge paints
      for (const ln of lines) {
        const bd = Array.isArray(ln?.breakdown) ? ln.breakdown : [];
        for (const b of bd) {
          const key = `${b?.paintName || 'Paint'}__${b?.type || ''}`;
          const prev = paintMap.get(key);
          const sqft = Number(b?.sqft ?? 0);
          const price = Number(b?.price ?? 0);

          if (!prev) {
            paintMap.set(key, {
              kind: 'paint',
              title: b?.paintName || 'Paint',
              // sub: `${b?.type || ''} (${Math.round(sqft)} sqft)`,
              sub: `${b?.type || ''}`,
              sqft,
              amount: price,
              type: b?.type || '',
            });
          } else {
            prev.sqft += sqft;
            prev.amount += price;
            prev.sub = `${prev.type} (${Math.round(prev.sqft)} sqft)`;
            paintMap.set(key, prev);
          }
        }

        // ✅ merge additional services
        const add = Array.isArray(ln?.additionalServices)
          ? ln.additionalServices
          : [];
        for (const a of add) {
          const title = a?.serviceType || 'Additional Service';
          const name = a?.customName?.trim() ? a.customName : a?.materialName;
          const key = `${title}__${name}__${a?.surfaceType || ''}`;

          const prev = addMap.get(key);
          const area = Number(a?.areaSqft ?? 0);
          const total = Number(a?.total ?? 0);

          if (!prev) {
            addMap.set(key, {
              kind: 'additional',
              title: `${title}`,
              sub: `${name || ''}${a?.surfaceType ? ` • ${a.surfaceType}` : ''
                } (${Math.round(area)} sqft)`,
              amount: total,
            });
          } else {
            prev.amount += total;
            addMap.set(key, prev);
          }
        }
      }

      const out = [...paintMap.values(), ...addMap.values()];

      const weight = item => {
        // paints first like reference, then additional services
        if (item.kind === 'additional') return 9;
        const t = String(item.type || '').toLowerCase();
        if (t.includes('ceiling')) return 1;
        if (t.includes('wall')) return 2;
        if (t.includes('measurement')) return 3;
        return 5;
      };

      out.sort((a, b) => {
        const wa = weight(a);
        const wb = weight(b);
        if (wa !== wb) return wa - wb;
        return String(a.title).localeCompare(String(b.title));
      });

      return out;
    } catch (e) {
      return [];
    }
  }, [quotes]);

  const openCall = phone => {
    try {
      const p = String(phone || '').trim();
      if (!p) return;
      Linking.openURL(`tel:${p}`);
    } catch (e) { }
  };

  console.log('leadDataContext', leadDataContext);
  console.log('quotes', quotes);
  console.log('measurementData', measurementData);

  // =========================
  // ✅ UI
  // =========================
  return (
    <ScrollView style={styles.page}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pageInner}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.png.png')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.hi}>
        Hi {safeText(header.customerName, 'Customer')}
      </Text>

      <Text style={styles.subText}>
        Here is a quote for your painting work based on accurate measurements.
        If you need any clarifications, reply to us.
      </Text>

      {/* Top summary row */}
      <View style={styles.topRow}>
        {/* Quote card */}
        <View style={styles.quoteCard}>
          <View style={styles.quotePill}>
            <Text style={styles.quotePillText}>Quote</Text>
          </View>
          {totals.discount?.amount > 0 && (
            <Text style={styles.smallMuted}>{rupee(totals.subtotal)}</Text>
          )}
          <Text style={styles.bigTotal}>
            {rupee(totals.grandTotal)}{' '}
            <Text style={styles.plusTaxes}>+ Taxes</Text>
          </Text>

          {/* <View style={styles.sep} /> */}

          <RowLine label="Interior" value={rupee(totals.interior)} />
          <RowLine label="Exterior" value={rupee(totals.exterior)} />
          <RowLine label="Other" value={rupee(totals.others)} />

          <View style={styles.sep} />

          <View style={styles.durationPill}>
            <Text style={styles.durationText}>
              <Text style={{ fontSize: 15, color: '#2B6CB0', marginTop: 4 }}>⏱</Text>
              {' '} Project Duration: {getDayLabel(quotes?.days)}
            </Text>
          </View>
        </View>

        {/* Guarantee card */}
        <View style={styles.guaranteeCard}>
          <View style={styles.guaranteePill}>
            <Text style={styles.guaranteePillText}>Homjee Guarantee</Text>
          </View>

          <GuaranteeItem text="Accurate area measurement." />
          <GuaranteeItem text="Genuine best quality paints." />
          <GuaranteeItem text="Dedicated project manager & trained painters." />
          <GuaranteeItem text="Furniture masking & post service cleanup." />
          <GuaranteeItem text="On-time project completion." />
        </View>
      </View>

      <Text style={styles.scrollHint}>
        *Scroll down to see detailed price breakup
      </Text>

      {/* Room-wise Painting Cost */}
      <SectionTitle title="Room-wise Painting Cost" />

      {/* Interior */}
      {roomWise?.Interior?.length ? (
        <CostTable
          title="For Interior"
          rooms={roomWise.Interior}
          rupee={rupee}
          modeLabel={modeLabel}
        />
      ) : null}

      {/* Exterior */}
      {roomWise?.Exterior?.length ? (
        <CostTable
          title="For Exterior"
          rooms={roomWise.Exterior}
          rupee={rupee}
          modeLabel={modeLabel}
        />
      ) : null}

      {/* Others */}
      {roomWise?.Others?.length ? (
        <CostTable
          title="For Others"
          rooms={roomWise.Others}
          rupee={rupee}
          modeLabel={modeLabel}
        />
      ) : null}

      {/* Why Choose */}
      <SectionTitle title="Why Choose Homjee" />
      <View style={styles.whyRow}>
        <WhyChip
          title="Dedicated Project Manager"
          icon={
            <Image
              source={{ uri: "https://img.icons8.com/dotty/80/20618d/user.png" }}
              style={styles.whyIconUser}
            />
          }
        />
        <WhyChip
          title="Genuine Product Used"
          icon={
            <Image
              source={{ uri: "https://img.icons8.com/ios/50/20618d/roller-brush--v1.png" }}
              style={styles.whyIcon}
            />
          }
        />
        <WhyChip
          title="100% Transparency"
          icon={
            <Image
              source={{ uri: "https://img.icons8.com/ios/50/20618d/diamond--v1.png" }}
              style={styles.whyIcon}
            />
          }
        />
        <WhyChip
          title="6 months service warranty"
          icon={
            <Image
              source={{ uri: "https://img.icons8.com/ios/50/20618d/approval--v1.png" }}
              style={styles.whyIcon}
            />
          }
        />
      </View>

      {/* Service-wise */}

      <View style={styles.tableBox}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Service-wise Cost </Text>
        </View>
        {/* <SectionTitle title="Service-wise Cost"  /> */}
        {serviceWise.map((it, idx) => (
          <View key={`${it.kind}-${it.title}-${idx}`} style={styles.tableRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.tableRowTitle}>{safeText(it.title)}</Text>
              <Text style={styles.tableRowSub}>{safeText(it.sub)}</Text>
            </View>
            <Text style={styles.tableRowAmt}>{rupee(it.amount)}</Text>
          </View>
        ))}

        <View style={styles.tableLine} />
        <MiniTotal label="Original Cost" value={rupee(totals.subtotal)} />
        <MiniTotal label="Discount" value={rupee(totals.discountAmount)} />
        <MiniTotal label="Final Cost" value={rupee(totals.grandTotal)} bold />

        <Text style={styles.note}>
          *All measurements are taken by laser device.
        </Text>
      </View>

      {/* Paint Process */}
      {/* <SectionTitle title="Paint Process" /> */}
      <View style={[styles.tableBox, { marginTop: 10 }]}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Paint Process</Text>
        </View>
        <View style={styles.processBox}>
          <ProcessCol
            title="Whitewash Process"
            items={[
              'Packaging & masking',
              'Sanding',
              '2 coats of putty',
              'Basic cleanup',
            ]}
          />
          <ProcessCol
            title="Repaint Process"
            items={[
              'Packaging & masking',
              'Sanding',
              'Minor damage repair',
              '1 coat primer',
              '2 coats of paint',
              'Basic cleanup',
            ]}
          />
          <ProcessCol
            title="Fresh Paint Process"
            items={[
              'Packaging & masking',
              'Damage repair',
              '2 coats of putty',
              'Hand sanding',
              '1 coat primer',
              '2 coats of paint',
              'Basic cleanup',
            ]}
          />
        </View>
      </View>

      {/* Paint Details */}
      <View style={[styles.tableBox, { marginTop: 10 }]}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Paint Details</Text>
        </View>
        <BlockBox>
          <Bullet text="Tractor Emulsion is a basic emulsion with smooth finish." />
          <Bullet text="Royale Luxury is a premium washable finish for interior walls." />
          <Bullet text="Oil enamel is durable and glossy for wood and metal surfaces." />
        </BlockBox>
      </View>
      {/* Scope of Work */}
      <SectionTitle title="Scope of Work T&C" />
      <BlockBox>
        <Bullet text="Homjee will only be responsible for the work mentioned in the quotation." />
        <Bullet text="Any work not covered in the quote will be considered extra." />
        <Bullet text="In case of any dispute, scope of work mentioned in the quote will be followed." />
      </BlockBox>

      {/* Payment T&C */}
      <SectionTitle title="Payment T&C" />
      <BlockBox>
        <Bullet text="40% advance to be paid before work starts." />
        <Bullet text="40% to be paid after 50% completion." />
        <Bullet text="20% to be paid at the end after final day of work." />
        <Bullet text="We do not accept cash. Payments should be made online only." />
      </BlockBox>

      {/* Warranty */}
      <SectionTitle title="Warranty T&C" />
      <BlockBox>
        <Text style={styles.para}>
          Warranty is applicable as per conditions defined below. The warranty
          starts from the date of completion of the painting project.
        </Text>
        <Bullet text="Warranty claim can be raised for paint peeling or major issues." />
        <Bullet text="Damage due to seepage, damp walls or external factors is not covered." />
        <Bullet text="Any misuse or changes by third party voids warranty." />
      </BlockBox>

      {/* Footer contact */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>In case you need any assistance,</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.footerText}>Please free to contact us on</Text>
          <Pressable onPress={() => openCall(header.vendorPhone)}>
            <Text style={styles.linkText}>
              {' '}
              +91 {safeText(header.vendorPhone, '—')}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          or write to us on{' '}
          <Text style={styles.linkText}>info@homjee.com </Text>
        </Text>
        {/* {header.vendorPhone ? (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => openCall(header.vendorPhone)}
          >
            <Text style={styles.callBtnText}>Call Now</Text>
          </TouchableOpacity>
        ) : null} */}

        <Text style={styles.thank}>❤️ Thank you ❤️</Text>
      </View>
    </ScrollView>
  );
}

// =========================
// Small Components
// =========================
function SectionTitle({ title }) {
  return (
    <View style={{ marginTop: 18, marginBottom: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function RowLine({ label, value }) {
  return (
    <View style={styles.rowLine}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function GuaranteeItem({ text }) {
  return (
    <View style={styles.gItem}>
      <Text style={styles.gTick}>✓</Text>
      <Text style={styles.gText}>{text}</Text>
    </View>
  );
}

function WhyChip({ title, icon }) {
  return (
    <View style={styles.whyChip}>
      <View style={styles.whyIconWrap}>{icon}</View>
      <Text style={styles.whyChipText} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

function MiniTotal({ label, value, bold }) {
  return (
    <View style={styles.miniTotalRow}>
      <Text
        style={[styles.miniLabel, bold && { fontFamily: 'Poppins-SemiBold' }]}
      >
        {label}
      </Text>
      <Text
        style={[styles.miniValue, bold && { fontFamily: 'Poppins-SemiBold' }]}
      >
        {value}
      </Text>
    </View>
  );
}

function BlockBox({ children }) {
  return <View style={styles.blockBox}>{children}</View>;
}

function Bullet({ text }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>-</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ProcessCol({ title, items }) {
  return (
    <View style={styles.processCol}>
      <View style={styles.processTitlePill}>
        <Text style={styles.processTitle}>{title}</Text>
      </View>
      {items.map((t, i) => (
        <View key={`${title}-${i}`} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>+</Text>
          <Text style={styles.processItem}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function CostTable({ title, rooms, rupee, modeLabel }) {
  const safeText = (v, fb = '—') => {
    try {
      const s = String(v ?? '').trim();
      return s.length ? s : fb;
    } catch (e) {
      return fb;
    }
  };

  const labelType = (t, roomName) => {
    const x = String(t || '').toLowerCase();

    if (x.includes('measurement')) {
      return roomName; // Door / Grills
    }

    if (x.includes('ceiling')) return 'Ceiling';
    if (x.includes('wall')) return 'Wall';

    return t;
  };

  return (
    <View style={styles.tableBox}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>{title} </Text>
      </View>

      {rooms.map((r, idx) => (
        <View key={`${r.roomName}-${idx}`}>
          {/* Room header */}
          <View style={styles.roomHeader}>
            <Text style={styles.roomTitle}>{safeText(r.roomName)}</Text>
            <Text style={styles.roomAmt}>{rupee(r.subtotal)}</Text>
          </View>

          {/* Paint breakdown */}
          {r.paintRows
            .filter(p => Number(p?.price ?? 0) > 0) // ✅ hide ₹0 rows
            .map((p, pi) => (
              <View key={`${r.roomName}-p-${pi}`} style={styles.roomRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  {/* ✅ Title: "Oil Luster Fresh Paint" / "Tractor Emulsion Repaint With Primer" */}
                  <Text style={styles.roomPaint}>
                    {safeText(p.paintName)} {modeLabel(p.mode)}
                  </Text>

                  {/* ✅ Sub: "4 Wall (355sqft)" */}
                  <Text style={styles.roomMeta}>
                    {Number(p.count || 0)} {labelType(p.type, r.roomName)} (
                    {Math.round(Number(p.sqft ?? 0))}sqft)
                  </Text>
                </View>

                <Text style={styles.roomRowAmt}>{rupee(p.price)}</Text>
              </View>
            ))}

          {/* ✅ Additional services under the same room */}
          {Array.isArray(r.additionalItems) && r.additionalItems.length ? (
            <>
              {/* <View style={styles.tableLine} /> */}
              {/* <View style={[styles.roomRow,
                {
                  backgroundColor: '#ddecff', borderTopWidth: 1,
                  borderTopColor: '#155f8a',
                }
              ]}>
                <Text
                  style={[styles.roomPaint, { fontFamily: 'Poppins-SemiBold' }]}
                >
                  Additional Services
                </Text>
                <Text
                  style={[
                    styles.roomRowAmt,
                    { fontFamily: 'Poppins-SemiBold' },
                  ]}
                >
                  {rupee(r.additionalTotal || 0)}
                </Text>
              </View> */}

              {r.additionalItems.map((a, ai) => (
                <View key={`${r.roomName}-add-${ai}`} style={styles.roomRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.roomPaint}>
                      {safeText(a.serviceType)}{' '}
                      {a.materialName ? `• ${a.materialName}` : ''}
                    </Text>
                    <Text style={styles.roomMeta}>
                      {a.surfaceType ? `${a.surfaceType} • ` : ''}(
                      {Math.round(Number(a.areaSqft ?? 0))} sqft) • ₹{' '}
                      {Number(a.unitPrice ?? 0)}/sqft
                    </Text>
                  </View>
                  <Text style={styles.roomRowAmt}>{rupee(a.total)}</Text>
                </View>
              ))}
            </>
          ) : null}

          {idx !== rooms.length - 1 ? <View style={styles.tableLine} /> : null}
        </View>
      ))}
    </View>
  );
}

// =========================
// Styles
// =========================
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  pageInner: { padding: 14, paddingBottom: 30 },

  header: { alignItems: 'center', marginTop: 6, marginBottom: 6 },
  logo: { width: 100, height: 26, resizeMode: 'contain' },

  hi: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#1B1B1B',
    marginTop: 6,
  },
  subText: {
    marginTop: 6,
    color: '#4B5563',
    fontSize: 11,
    lineHeight: 18,
    fontFamily: 'Poppins-Medium',
  },

  topRow: { flexDirection: 'row', gap: 10, marginTop: 14 },

  quoteCard: {
    flex: 1.05,
    backgroundColor: '#ddecff',
    borderRadius: 14,
    padding: 12,
    // borderWidth: 1,
    // borderColor: "#CFE3FF",
  },
  quotePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#2B6CB0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  quotePillText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },

  smallMuted: {
    color: '#2B6CB0',
    fontSize: 11,
    textDecorationLine: 'line-through',
    fontFamily: 'Poppins-SemiBold',
  },
  bigTotal: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  plusTaxes: { fontSize: 10, fontFamily: 'Poppins-SemiBold', color: '#3279a7' },

  sep: { height: 1, backgroundColor: '#46748f', marginVertical: 10 },

  rowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  rowLabel: { color: '#1F2937', fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  rowValue: { color: '#1F2937', fontSize: 10, fontFamily: 'Poppins-SemiBold' },

  durationPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    // backgroundColor: '#D6ECFF',
    // paddingHorizontal: 10,
    paddingVertical: 6,
    // borderRadius: 999,
  },
  durationText: {
    color: '#1F2937',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },

  guaranteeCard: {
    flex: 0.95,
    backgroundColor: '#ddecff',
    borderRadius: 14,
    padding: 12,
    // borderWidth: 1,
    // borderColor: "#DDEBFF",
  },
  guaranteePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#2B6CB0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
  },

  guaranteePillText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },

  gItem: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
    alignItems: 'flex-start',
  },

  gTick: { color: '#2B6CB0', fontFamily: 'Poppins-SemiBold', marginTop: 1 },
  gText: {
    flex: 1, color: '#1F2937',
    fontFamily: 'Poppins-Regular', fontSize: 10, lineHeight: 16
  },

  scrollHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 9,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },

  sectionTitle: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },

  tableBox: {
    // backgroundColor: "#F8FBFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#98c7e4', // whole box
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableHeader: {
    // backgroundColor: "#EAF3FF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#155f8a', // dark border blue
  },
  tableHeaderText: {
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#1F2937',
  },

  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ddecff', // light blue
    borderTopWidth: 1,
    borderTopColor: '#155f8a', // dark border blue
  },
  roomTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11, color: '#111827'
  },
  roomAmt: {
    fontFamily: 'Poppins-SemiBold', fontSize: 11,
    color: '#111827'
  },

  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    // borderTopWidth: 1,
    // borderTopColor: "#EEF4FF",
  },
  roomPaint: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    fontSize: 11,
  },
  roomMeta: {
    color: '#6B7280',
    fontFamily: 'Poppins-Regular', fontSize: 10, marginTop: 2
  },
  roomRowAmt: {
    fontFamily: 'Poppins-Medium',
    color: '#111827', fontSize: 11,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    // backgroundColor: '#FFFFFF',
    // borderTopWidth: 1,
    // borderTopColor: '#EEF4FF',
  },
  tableRowTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    fontSize: 11,
  },
  tableRowSub: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  tableRowAmt: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827', fontSize: 11,
  },

  tableLine: {
    borderTopWidth: 1,
    borderTopColor: '#155f8a',
  }, //additional service

  miniTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF4FF',
  },

  miniLabel: {
    color: '#374151',
    fontSize: 11, fontFamily: 'Poppins-SemiBold'
  },
  miniValue: {
    color: '#111827',
    fontSize: 11, fontFamily: 'Poppins-SemiBold'
  },

  note: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 9,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    backgroundColor: '#277cb3',
    borderTopWidth: 1,
    borderTopColor: '#EEF4FF',
  },

  whyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  whyChip: {
    width: '48%',          // ✅ 2 columns
    alignItems: 'center',  // ✅ center icon + text
    justifyContent: 'center',
    // backgroundColor: '#F1F5F9',
    // borderWidth: 1,
    // borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 10,      // ✅ row gap
  },

  whyIconWrap: {
    width: 32,
    height: 32,
    // borderRadius: 10,
    // backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  whyIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  whyIconUser: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  whyChipText: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#0b3769',
    lineHeight: 15, marginTop: 10
  },

  processBox: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  processCol: {
    flex: 1,
    // backgroundColor: '#F8FBFF',
    // borderWidth: 1,
    // borderColor: '#D6E7FF',
    // borderRadius: 14,
    padding: 10,
  },
  processTitlePill: {
    backgroundColor: '#277cb3',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  processTitle: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    // textAlign: 'center',
  },
  processItem: {
    flex: 1,
    color: '#000000',
    fontSize: 10.8,
    lineHeight: 14,
    fontFamily: 'Poppins-Regular',
  },

  blockBox: {
    // backgroundColor: '#F8FBFF',
    // borderWidth: 1,
    // borderColor: '#D6E7FF',
    // borderRadius: 14,
    padding: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  bulletDot: {
    fontFamily: 'Poppins-Medium',
    color: 'black',
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    color: '#707274',
    fontSize: 11,
    lineHeight: 17,
  },
  para: {
    color: '#707274',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Poppins-Medium',
    marginBottom: 5,
  },

  footer: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    color: '#707274',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: 12,
  },
  linkText: {
    color: '#2563EB',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  callBtn: {
    marginTop: 10,
    backgroundColor: '#2B6CB0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  callBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },

  thank: {
    marginTop: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
});
