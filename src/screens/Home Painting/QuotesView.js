import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  BackHandler,
} from "react-native";
import { useLeadContext } from "../../Utilities/LeadContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getRequest } from "../../ApiService/apiHelper";
import { API_ENDPOINTS } from "../../ApiService/apiConstants";

// ✅ optional: replace with your logo
const LOGO_URI = "../../logo.png.png";

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
        setQuotes(response.quote)
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
  const rupee = (val) => {
    try {
      const num = Number(val);
      if (!Number.isFinite(num)) return "—";
      return `₹ ${num.toLocaleString("en-IN")}`;
    } catch (e) {
      return "—";
    }
  };

  const safeText = (v, fallback = "—") => {
    try {
      const s = String(v ?? "").trim();
      return s.length ? s : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const getDayLabel = (days) => {
    try {
      const d = Number(days ?? 0);
      if (!Number.isFinite(d) || d <= 0) return "—";
      return `${d} ${d === 1 ? "Day" : "Days"}`;
    } catch (e) {
      return "—";
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
          .join(", ") || "—";

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
        discount: quotes.discount
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

  console.log("totals", totals);
  console.log(" totals.discount", totals.discount?.amount);


  // Room-wise structure like reference
  const roomWise = useMemo(() => {
    try {
      const lines = Array.isArray(quotes?.lines) ? quotes.lines : [];
      const bySection = { Interior: [], Exterior: [], Others: [] };

      const weightType = (t) => {
        const x = String(t || "").toLowerCase();
        if (x.includes("ceiling")) return 1;
        if (x.includes("wall")) return 2;
        if (x.includes("measurement")) return 3; // for Doors/Grills
        return 9;
      };

      for (const ln of lines) {
        const sectionType = ln?.sectionType || "Others";

        // ✅ Merge breakdown duplicates (same paint + type + mode)
        const bd = Array.isArray(ln?.breakdown) ? ln.breakdown : [];
        const map = new Map();

        for (const b of bd) {
          // Skip zero sqft rows if you don’t want them (Ceiling sqft 0 in your data)
          // if (Number(b?.sqft ?? 0) <= 0) continue;

          const key = `${b?.paintName || "Paint"}__${b?.type || ""}__${b?.mode || ""}`;
          const prev = map.get(key);
          const sqft = Number(b?.sqft ?? 0);
          const price = Number(b?.price ?? 0);

          if (!prev) {
            map.set(key, {
              type: b?.type,
              mode: b?.mode,
              paintName: b?.paintName,
              sqft,
              price,
              unitPrice: Number(b?.unitPrice ?? 0),
            });
          } else {
            prev.sqft += sqft;
            prev.price += price;
            map.set(key, prev);
          }
        }

        const mergedBreakdown = Array.from(map.values()).sort((a, b) => {
          const wa = weightType(a.type);
          const wb = weightType(b.type);
          if (wa !== wb) return wa - wb;
          return String(a.paintName || "").localeCompare(String(b.paintName || ""));
        });

        // ✅ Additional services
        const add = Array.isArray(ln?.additionalServices) ? ln.additionalServices : [];
        const additionalItems = add.map((x) => ({
          serviceType: x?.serviceType || "Additional Service",
          materialName: x?.customName?.trim() ? x.customName : x?.materialName,
          surfaceType: x?.surfaceType || "",
          areaSqft: Number(x?.areaSqft ?? 0),
          unitPrice: Number(x?.unitPrice ?? 0),
          total: Number(x?.total ?? 0),
          withPaint: !!x?.withPaint,
        }));

        const roomRow = {
          roomName: ln?.roomName || "Room",
          subtotal: Number(ln?.subtotal ?? 0),
          mergedBreakdown,
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
  }, [quotes]);

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
          const key = `${b?.paintName || "Paint"}__${b?.type || ""}`;
          const prev = paintMap.get(key);
          const sqft = Number(b?.sqft ?? 0);
          const price = Number(b?.price ?? 0);

          if (!prev) {
            paintMap.set(key, {
              kind: "paint",
              title: b?.paintName || "Paint",
              sub: `${b?.type || ""} (${Math.round(sqft)} sqft)`,
              sqft,
              amount: price,
              type: b?.type || "",
            });
          } else {
            prev.sqft += sqft;
            prev.amount += price;
            prev.sub = `${prev.type} (${Math.round(prev.sqft)} sqft)`;
            paintMap.set(key, prev);
          }
        }

        // ✅ merge additional services
        const add = Array.isArray(ln?.additionalServices) ? ln.additionalServices : [];
        for (const a of add) {
          const title = a?.serviceType || "Additional Service";
          const name = a?.customName?.trim() ? a.customName : a?.materialName;
          const key = `${title}__${name}__${a?.surfaceType || ""}`;

          const prev = addMap.get(key);
          const area = Number(a?.areaSqft ?? 0);
          const total = Number(a?.total ?? 0);

          if (!prev) {
            addMap.set(key, {
              kind: "additional",
              title: `${title}`,
              sub: `${name || ""}${a?.surfaceType ? ` • ${a.surfaceType}` : ""} (${Math.round(area)} sqft)`,
              amount: total,
            });
          } else {
            prev.amount += total;
            addMap.set(key, prev);
          }
        }
      }

      const out = [...paintMap.values(), ...addMap.values()];

      const weight = (item) => {
        // paints first like reference, then additional services
        if (item.kind === "additional") return 9;
        const t = String(item.type || "").toLowerCase();
        if (t.includes("ceiling")) return 1;
        if (t.includes("wall")) return 2;
        if (t.includes("measurement")) return 3;
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

  const openCall = (phone) => {
    try {
      const p = String(phone || "").trim();
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
    <ScrollView style={styles.page} contentContainerStyle={styles.pageInner}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/logo.png.png")} style={styles.logo} />
      </View>

      <Text style={styles.hi}>
        Hi {safeText(header.customerName, "Customer")}
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
          {totals.discount?.amount > 0 &&
            <Text style={styles.smallMuted}>{rupee(totals.subtotal)}</Text>
          }
          <Text style={styles.bigTotal}>
            {rupee(totals.grandTotal)}{" "}
            <Text style={styles.plusTaxes}>+ Taxes</Text>
          </Text>

          <View style={styles.sep} />

          <RowLine label="Interior" value={rupee(totals.interior)} />
          <RowLine label="Exterior" value={rupee(totals.exterior)} />
          <RowLine label="Other" value={rupee(totals.others)} />

          <View style={styles.sep} />

          <View style={styles.durationPill}>
            <Text style={styles.durationText}>
              Project Duration: {getDayLabel(quotes?.days)}
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
        Scroll down to see detailed price breakup
      </Text>

      {/* Room-wise Painting Cost */}
      <SectionTitle title="Room-wise Painting Cost" />

      {/* Interior */}
      {roomWise?.Interior?.length ? (
        <CostTable
          title="For Interior"
          rooms={roomWise.Interior}
          rupee={rupee}
        />
      ) : null}

      {/* Exterior */}
      {roomWise?.Exterior?.length ? (
        <CostTable
          title="For Exterior"
          rooms={roomWise.Exterior}
          rupee={rupee}
        />
      ) : null}

      {/* Others */}
      {roomWise?.Others?.length ? (
        <CostTable title="For Others" rooms={roomWise.Others} rupee={rupee} />
      ) : null}

      {/* Why Choose */}
      <SectionTitle title="Why Choose Homjee" />
      <View style={styles.whyRow}>
        <WhyChip title="Dedicated Project Manager" />
        <WhyChip title="Genuine Product Used" />
        <WhyChip title="100% Transparency" />
        <WhyChip title="6 months service warranty" />
      </View>

      {/* Service-wise */}
      <SectionTitle title="Service-wise Cost" />
      <View style={styles.tableBox}>
        {serviceWise.map((it, idx) => (
          <View key={`${it.paintName}-${it.type}-${idx}`} style={styles.tableRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.tableRowTitle}>{safeText(it.paintName)}</Text>
              <Text style={styles.tableRowSub}>
                {safeText(it.type)} ({Math.round(Number(it.sqft ?? 0))} sqft)
              </Text>
            </View>
            <Text style={styles.tableRowAmt}>{rupee(it.price)}</Text>
          </View>
        ))}

        <View style={styles.tableLine} />
        <MiniTotal label="Original Cost" value={rupee(totals.subtotal)} />
        <MiniTotal label="Discount" value={rupee(totals.discountAmount)} />
        <MiniTotal
          label="Final Cost"
          value={rupee(totals.grandTotal)}
          bold
        />

        <Text style={styles.note}>
          All measurements are taken by laser device.
        </Text>
      </View>

      {/* Paint Process */}
      <SectionTitle title="Paint Process" />
      <View style={styles.processBox}>
        <ProcessCol
          title="Whitewash Process"
          items={[
            "Packaging & masking",
            "Sanding",
            "2 coats of putty",
            "Basic cleanup",
          ]}
        />
        <ProcessCol
          title="Repaint Process"
          items={[
            "Packaging & masking",
            "Sanding",
            "Minor damage repair",
            "1 coat primer",
            "2 coats of paint",
            "Basic cleanup",
          ]}
        />
        <ProcessCol
          title="Fresh Paint Process"
          items={[
            "Packaging & masking",
            "Damage repair",
            "2 coats of putty",
            "Hand sanding",
            "1 coat primer",
            "2 coats of paint",
            "Basic cleanup",
          ]}
        />
      </View>

      {/* Paint Details */}
      <SectionTitle title="Paint Details" />
      <BlockBox>
        <Bullet text="Tractor Emulsion is a basic emulsion with smooth finish." />
        <Bullet text="Royale Luxury is a premium washable finish for interior walls." />
        <Bullet text="Oil enamel is durable and glossy for wood and metal surfaces." />
      </BlockBox>

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
        <Text style={styles.footerText}>
          Need assistance? Contact us at{" "}
          <Text style={styles.linkText}>
            {safeText(header.vendorPhone, "—")}
          </Text>
        </Text>

        {header.vendorPhone ? (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => openCall(header.vendorPhone)}
          >
            <Text style={styles.callBtnText}>Call Now</Text>
          </TouchableOpacity>
        ) : null}

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

function WhyChip({ title }) {
  return (
    <View style={styles.whyChip}>
      <Text style={styles.whyChipText}>{title}</Text>
    </View>
  );
}

function MiniTotal({ label, value, bold }) {
  return (
    <View style={styles.miniTotalRow}>
      <Text style={[styles.miniLabel, bold && { fontFamily: 'Poppins-SemiBold' }]}>
        {label}
      </Text>
      <Text style={[styles.miniValue, bold && { fontFamily: 'Poppins-SemiBold' }]}>
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
      <Text style={styles.bulletDot}>•</Text>
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
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.processItem}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function CostTable({ title, rooms, rupee }) {
  const safeText = (v, fb = "—") => {
    try {
      const s = String(v ?? "").trim();
      return s.length ? s : fb;
    } catch (e) {
      return fb;
    }
  };

  const labelType = (t) => {
    const x = String(t || "");
    return x; // Ceiling / Wall / Measurement
  };

  return (
    <View style={styles.tableBox}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>{title}</Text>
      </View>

      {rooms.map((r, idx) => (
        <View key={`${r.roomName}-${idx}`}>
          {/* Room header */}
          <View style={styles.roomHeader}>
            <Text style={styles.roomTitle}>{safeText(r.roomName)}</Text>
            <Text style={styles.roomAmt}>{rupee(r.subtotal)}</Text>
          </View>

          {/* Paint breakdown */}
          {r.mergedBreakdown.map((b, bi) => (
            <View key={`${r.roomName}-${b.paintName}-${bi}`} style={styles.roomRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.roomPaint}>{safeText(b.paintName)}</Text>
                <Text style={styles.roomMeta}>
                  {labelType(b.type)} {b.mode ? `• ${b.mode}` : ""} ({Math.round(Number(b.sqft ?? 0))} sqft)
                </Text>
              </View>
              <Text style={styles.roomRowAmt}>{rupee(b.price)}</Text>
            </View>
          ))}

          {/* ✅ Additional services under the same room */}
          {Array.isArray(r.additionalItems) && r.additionalItems.length ? (
            <>
              <View style={styles.tableLine} />
              <View style={[styles.roomRow, { backgroundColor: "#F8FBFF" }]}>
                <Text style={[styles.roomPaint, { fontFamily: 'Poppins-SemiBold' }]}>
                  Additional Services
                </Text>
                <Text style={[styles.roomRowAmt, { fontFamily: 'Poppins-SemiBold' }]}>
                  {rupee(r.additionalTotal || 0)}
                </Text>
              </View>

              {r.additionalItems.map((a, ai) => (
                <View key={`${r.roomName}-add-${ai}`} style={styles.roomRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.roomPaint}>
                      {safeText(a.serviceType)} {a.materialName ? `• ${a.materialName}` : ""}
                    </Text>
                    <Text style={styles.roomMeta}>
                      {a.surfaceType ? `${a.surfaceType} • ` : ""}
                      ({Math.round(Number(a.areaSqft ?? 0))} sqft) • ₹ {Number(a.unitPrice ?? 0)}/sqft
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
  page: { flex: 1, backgroundColor: "#FFFFFF" },
  pageInner: { padding: 14, paddingBottom: 30 },

  header: { alignItems: "center", marginTop: 6, marginBottom: 6 },
  logo: { width: 140, height: 46, resizeMode: "contain" },

  hi: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: "#1B1B1B", marginTop: 6 },
  subText: {
    marginTop: 6,
    color: "#4B5563",
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: 'Poppins-Medium',
  },

  topRow: { flexDirection: "row", gap: 10, marginTop: 14 },

  quoteCard: {
    flex: 1.05,
    backgroundColor: "#EAF3FF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#CFE3FF",
  },
  quotePill: {
    alignSelf: "flex-start",
    backgroundColor: "#2B6CB0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  quotePillText: { color: "#fff", fontFamily: 'Poppins-SemiBold', fontSize: 12 },

  smallMuted: {
    color: "#2B6CB0", fontSize: 12, textDecorationLine: "line-through",
    fontFamily: 'Poppins-SemiBold'
  },
  bigTotal: { marginTop: 2, fontSize: 22, fontFamily: 'Poppins-SemiBold', color: "#111827" },
  plusTaxes: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: "#6B7280" },

  sep: { height: 1, backgroundColor: "#CFE3FF", marginVertical: 10 },

  rowLine: { flexDirection: "row", justifyContent: "space-between", marginVertical: 3 },
  rowLabel: { color: "#334155", fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  rowValue: { color: "#111827", fontSize: 12, fontFamily: 'Poppins-SemiBold' },

  durationPill: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#D6ECFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  durationText: { color: "#1F2937", fontSize: 11.5, fontFamily: 'Poppins-SemiBold' },

  guaranteeCard: {
    flex: 0.95,
    backgroundColor: "#F3F8FF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDEBFF",
  },
  guaranteePill: {
    alignSelf: "flex-start",
    backgroundColor: "#2B6CB0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
  },
  guaranteePillText: { color: "#fff", fontFamily: 'Poppins-SemiBold', fontSize: 12 },

  gItem: { flexDirection: "row", gap: 8, marginVertical: 4, alignItems: "flex-start" },
  gTick: { color: "#2B6CB0", fontFamily: 'Poppins-SemiBold', marginTop: 1 },
  gText: { flex: 1, color: "#1F2937", fontSize: 12, lineHeight: 16 },

  scrollHint: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 11,
    color: "#6B7280",
    fontFamily: 'Poppins-Regular'
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: "#111827",
  },

  tableBox: {
    backgroundColor: "#F8FBFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E7FF",
    overflow: "hidden",
    marginBottom: 12,
  },
  tableHeader: {
    backgroundColor: "#EAF3FF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D6E7FF",
  },
  tableHeaderText: { textAlign: "center", fontFamily: 'Poppins-SemiBold', color: "#1F2937" },

  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#EAF3FF",
    borderTopWidth: 1,
    borderTopColor: "#D6E7FF",
  },
  roomTitle: { fontFamily: 'Poppins-SemiBold', color: "#111827" },
  roomAmt: { fontFamily: 'Poppins-SemiBold', color: "#111827" },

  roomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF4FF",
  },
  roomPaint: { fontFamily: 'Poppins-SemiBold', color: "#111827", fontSize: 12.5 },
  roomMeta: { color: "#6B7280", fontSize: 11, marginTop: 2 },
  roomRowAmt: { fontFamily: 'Poppins-SemiBold', color: "#111827" },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF4FF",
  },
  tableRowTitle: { fontFamily: 'Poppins-SemiBold', color: "#111827", fontSize: 12.5 },
  tableRowSub: { color: "#6B7280", fontSize: 11, marginTop: 2 },
  tableRowAmt: { fontFamily: 'Poppins-SemiBold', color: "#111827" },

  tableLine: { height: 1, backgroundColor: "#D6E7FF" },

  miniTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF4FF",
  },
  miniLabel: { color: "#374151", fontFamily: 'Poppins-SemiBold' },
  miniValue: { color: "#111827", fontFamily: 'Poppins-SemiBold' },

  note: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#6B7280",
    fontSize: 10.5,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF4FF",
  },

  whyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  whyChip: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: "45%",
  },
  whyChipText: { textAlign: "center", fontSize: 11.5, fontFamily: 'Poppins-SemiBold', color: "#111827" },

  processBox: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  processCol: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#D6E7FF",
    borderRadius: 14,
    padding: 10,
  },
  processTitlePill: {
    backgroundColor: "#2B6CB0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  processTitle: { color: "#fff", fontFamily: 'Poppins-SemiBold', fontSize: 11, textAlign: "center" },
  processItem: { flex: 1, color: "#1F2937", fontSize: 10.8, lineHeight: 15 },

  blockBox: {
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#D6E7FF",
    borderRadius: 14,
    padding: 12,
  },
  bulletRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  bulletDot: { fontFamily: 'Poppins-SemiBold', color: "#2B6CB0" },
  bulletText: { flex: 1, color: "#1F2937", fontSize: 12, lineHeight: 17 },
  para: { color: "#1F2937", fontSize: 12, lineHeight: 17 },

  footer: { marginTop: 18, alignItems: "center" },
  footerText: { color: "#374151", fontFamily: 'Poppins-SemiBold', textAlign: "center" },
  linkText: { color: "#2563EB", fontFamily: 'Poppins-SemiBold', },

  callBtn: {
    marginTop: 10,
    backgroundColor: "#2B6CB0",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  callBtnText: { color: "#fff", fontFamily: 'Poppins-SemiBold', },

  thank: { marginTop: 14, fontFamily: 'Poppins-SemiBold', color: "#111827" },
});
