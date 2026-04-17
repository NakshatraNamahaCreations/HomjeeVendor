// // PaintDropdownModal.js
// import React, { useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   StyleSheet,
// } from 'react-native';

// export default function PaintDropdownModal({
//   value,
//   onChange,
//   options = [],
//   placeholder = 'Type of Paint',
// }) {
//   const [visible, setVisible] = useState(false);
//   const [selected, setSelected] = useState(value);

//   // ✅ 1) DEDUPE OPTIONS (fix duplicates in package flow)
//   // const uniqueOptions = useMemo(() => {
//   //   try {
//   //     const list = Array.isArray(options) ? options : [];

//   //     const normName = (s) =>
//   //       String(s || "").trim().replace(/\s+/g, " ").toLowerCase();

//   //     const map = new Map(); // key -> chosen item

//   //     for (const it of list) {
//   //       if (!it) continue;

//   //       const key = `${normName(it?.name || it?.label)}__${normName(it?.city)}`;

//   //       if (!map.has(key)) {
//   //         map.set(key, it);
//   //         continue;
//   //       }

//   //       // If duplicate name exists, keep the one with smaller `order` (priority),
//   //       // else fallback to the first one.
//   //       const prev = map.get(key);
//   //       const prevOrder = Number(prev?.order ?? 999999);
//   //       const currOrder = Number(it?.order ?? 999999);

//   //       if (currOrder < prevOrder) map.set(key, it);
//   //     }

//   //     const out = Array.from(map.values());

//   //     // Optional sort: specials on top, then by `order`, then by name
//   //     out.sort((a, b) => {
//   //       const as = a?.isSpecial ? 1 : 0;
//   //       const bs = b?.isSpecial ? 1 : 0;
//   //       if (bs !== as) return bs - as;

//   //       const ao = Number(a?.order ?? 999999);
//   //       const bo = Number(b?.order ?? 999999);
//   //       if (ao !== bo) return ao - bo;

//   //       return String(a?.name || "").localeCompare(String(b?.name || ""));
//   //     });

//   //     return out;
//   //   } catch (e) {
//   //     console.log("dedupe error:", e);
//   //     return Array.isArray(options) ? options : [];
//   //   }
//   // }, [options]);

//   const uniqueOptions = useMemo(() => {
//     try {
//       const list = Array.isArray(options) ? options : [];

//       const normName = s =>
//         String(s || '')
//           .trim()
//           .replace(/\s+/g, ' ')
//           .toLowerCase();

//       const map = new Map();

//       for (const it of list) {
//         if (!it) continue;

//         const key = `${normName(it?.name || it?.label)}__${normName(it?.city)}`;

//         if (!map.has(key)) {
//           map.set(key, it);
//           continue;
//         } 
//         const prev = map.get(key);
//         const prevOrder = Number(prev?.order ?? 999999);
//         const currOrder = Number(it?.order ?? 999999);

//         if (currOrder < prevOrder) {
//           map.set(key, it);
//         }
//       }

//       const out = Array.from(map.values());

//       out.sort((a, b) => {
//         try {
//           const ao = Number(a?.order ?? 999999);
//           const bo = Number(b?.order ?? 999999);

//           if (ao !== bo) return ao - bo;

//           return String(a?.name || '').localeCompare(String(b?.name || ''));
//         } catch (e) {
//           console.log('paint sort error:', e);
//           return 0;
//         }
//       });

//       return out;
//     } catch (e) {
//       console.log('dedupe error:', e);
//       return Array.isArray(options) ? options : [];
//     }
//   }, [options]);

//   const handleSelect = item => {
//     try {
//       setSelected(item);
//       onChange?.(item); // pass selected value to parent
//     } catch (e) {
//       console.log('handleSelect error:', e);
//     }
//   };

//   const label = value ? value.name || value.label : placeholder;

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
//         <Text style={styles.selectorText}>{label}</Text>
//       </TouchableOpacity>

//       <Modal visible={visible} transparent animationType="slide">
//         <View style={styles.overlay}>
//           <View style={styles.modalBox}>
//             <View style={styles.header}>
//               <Text style={styles.title}>Type of Paint</Text>
//               <TouchableOpacity onPress={() => setVisible(false)}>
//                 <Text style={styles.close}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={uniqueOptions} // ✅ use deduped list
//               keyExtractor={(item, index) => String(item?._id || item?.name || index)}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[
//                     styles.item,
//                     selected?._id === item?._id && styles.selectedItem,
//                   ]}
//                   onPress={() => {
//                     try {
//                       handleSelect(item);
//                       setVisible(false);
//                     } catch (e) {
//                       console.log('select press error:', e);
//                     }
//                   }}
//                 >
//                   <View style={{ justifyContent: 'flex-start', flex: 0.7 }}>
//                     {item?.isSpecial && <Text style={styles.star}>⭐ </Text>}
//                     <Text style={styles.itemText}>{item?.name}</Text>
//                   </View>

//                   <Text style={styles.price}>
//                     (Rs. {Number(item?.price || 0).toFixed(2)})
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { marginHorizontal: 20, marginTop: 10 },
//   selector: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 7,
//     backgroundColor: 'white',
//   },
//   selectorText: { fontSize: 14, color: '#000', fontFamily: 'Poppins-Medium' },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.56)',
//     justifyContent: 'center',
//   },
//   modalBox: {
//     backgroundColor: 'white',
//     maxHeight: '80%',
//     margin: 2,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   title: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
//   close: { fontSize: 18, color: 'red', fontFamily: 'Poppins-Bold' },
//   item: {
//     flexDirection: 'row',
//     flex: 1,
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   selectedItem: { backgroundColor: '#f0f8ff' },
//   itemText: { fontSize: 13, fontFamily: 'Poppins-Medium' },
//   price: {
//     flex: 0.3,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     fontSize: 13,
//     color: '#555',
//     fontFamily: 'Poppins-Medium',
//   },
//   star: {
//     fontSize: 16,
//     color: 'gold',
//     marginRight: 4,
//     marginTop: -3,
//     fontFamily: 'Poppins-Medium',
//   },
// });


import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function PaintDropdownModal({
  value,
  onChange,
  options = [],
  placeholder = 'Type of Paint',
}) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(value || null);

  useEffect(() => {
    try {
      setSelected(value || null);
    } catch (e) {
      console.log('selected sync error:', e);
    }
  }, [value]);

  const uniqueOptions = useMemo(() => {
    try {
      const list = Array.isArray(options) ? options : [];

      const normName = s =>
        String(s || '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase();

      const map = new Map();

      for (const it of list) {
        if (!it) continue;

        const key = normName(it?.name || it?.label);

        if (!map.has(key)) {
          map.set(key, it);
          continue;
        }

        const prev = map.get(key);
        const prevOrder = Number(prev?.order ?? 999999);
        const currOrder = Number(it?.order ?? 999999);

        if (currOrder < prevOrder) {
          map.set(key, it);
        }
      }

      const out = Array.from(map.values());

      out.sort((a, b) => {
        try {
          const ao = Number(a?.order ?? 999999);
          const bo = Number(b?.order ?? 999999);

          if (ao !== bo) return ao - bo;

          return String(a?.name || '').localeCompare(String(b?.name || ''));
        } catch (e) {
          console.log('paint sort error:', e);
          return 0;
        }
      });

      return out;
    } catch (e) {
      console.log('dedupe error:', e);
      return Array.isArray(options) ? options : [];
    }
  }, [options]);

  const handleSelect = item => {
    try {
      setSelected(item);
      onChange?.(item);
    } catch (e) {
      console.log('handleSelect error:', e);
    }
  };

  const label = value ? value.name || value.label : placeholder;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
        <Text style={styles.selectorText}>{label}</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.header}>
              <Text style={styles.title}>Type of Paint</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              {uniqueOptions.map((item, index) => (
                <TouchableOpacity
                  key={String(item?._id || item?.name || index)}
                  style={[
                    styles.item,
                    selected?._id === item?._id && styles.selectedItem,
                  ]}
                  onPress={() => {
                    try {
                      handleSelect(item);
                      setVisible(false);
                    } catch (e) {
                      console.log('select press error:', e);
                    }
                  }}
                >
                  <View style={styles.leftBlock}>
                    {item?.isSpecial ? <Text style={styles.star}>⭐</Text> : null}
                    <Text style={styles.itemText}>
                      {item?.name}
                    </Text>
                  </View>

                  <Text style={styles.price}>
                    (Rs. {Number(item?.price || 0).toFixed(2)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 20, marginTop: 10 },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 7,
    backgroundColor: 'white',
  },
  selectorText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Medium',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    maxHeight: '80%',
    margin: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  close: {
    fontSize: 18,
    color: 'red',
    fontFamily: 'Poppins-Bold',
  },
  item: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  leftBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#000',
  },
  price: {
    width: 95,
    textAlign: 'right',
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins-Medium',
  },
  star: {
    fontSize: 16,
    color: 'gold',
    marginRight: 6,
  },
});