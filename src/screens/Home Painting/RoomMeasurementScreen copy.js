// RoomMeasurementScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../Utilities/ThemeContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import { useLeadContext } from '../../Utilities/LeadContext';
import { useVendorContext } from '../../Utilities/VendorContext';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import { useRoomNameContext } from '../../Utilities/RoomContext';

const RoomMeasurementScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const MODE = { REPAINT: 'REPAINT', FRESH: 'FRESH' };
  const { deviceTheme } = useThemeColor();
  const scrollViewRef = useRef(null);
  const { leadDataContext } = useLeadContext();
  const { vendorDataContext } = useVendorContext();
  const { nameOfTheRoom, setNameOfTheRoom } = useRoomNameContext();
  const { type, activeTab } = route.params;
  const rawType = route?.params?.type;

  const [error, setError] = useState('');
  const [roomDefaultMode, setRoomDefaultMode] = useState(MODE.REPAINT);
  const [etstimateData, setEstimateData] = useEstimateContext();
  const [sections, setSections] = useState([]);

  const normalizeType = (v, fallback = 'grill') => {
    if (typeof v === 'string') {
      const s = v.trim();
      if (s) return s.toLowerCase();
    }
    return fallback;
  };

  const isFixedOthers =
    activeTab === 'Others' &&
    ['doors', 'grills'].includes((type || '').trim().toLowerCase());

  const isRoomLike =
    activeTab === 'Interior' ||
    activeTab === 'Exterior' ||
    (activeTab === 'Others' && !isFixedOthers);

  const asStr = v => (v === 0 || v === '0' ? '0' : (v ?? '') + '');

  const buildDefaultSections = (
    tab,
    defaultMode = MODE.REPAINT,
    measurementType = type,
  ) => {
    const makeCeiling = label => ({
      type: 'ceiling',
      width: '',
      height: '',
      windows: [],
      doors: [],
      cupboards: [],
      label,
      mode: defaultMode,
      customMode: false,
    });

    const makeWall = label => ({
      type: 'wall',
      width: '',
      height: '',
      windows: [],
      doors: [],
      cupboards: [],
      label,
      mode: defaultMode,
      customMode: false,
    });

    const makeOther = (label, t) => {
      const key = normalizeType(t ?? measurementType, 'grill');
      return {
        type: key,
        width: '',
        height: '',
        label,
        mode: defaultMode,
        customMode: false,
      };
    };

    switch ((tab || '').trim()) {
      case 'Interior':
        return [
          makeCeiling('Ceiling 1'),
          makeWall('Wall 1'),
          makeWall('Wall 2'),
          makeWall('Wall 3'),
          makeWall('Wall 4'),
        ];
      case 'Exterior':
        return [
          makeCeiling('Ceiling 1'),
          makeWall('Wall 1'),
          makeWall('Wall 2'),
          makeWall('Wall 3'),
          makeWall('Wall 4'),
        ];
      case 'Others':
        if (isFixedOthers) {
          return Array.from({ length: 4 }, (_, i) =>
            makeOther(`${measurementType} ${i + 1}`),
          );
        }
        return [
          makeCeiling('Ceiling 1'),
          makeWall('Wall 1'),
          makeWall('Wall 2'),
          makeWall('Wall 3'),
          makeWall('Wall 4'),
        ];
      default:
        return [];
    }
  };

  const hydrateFromRoom = useCallback(
    (tab, room, measurementType) => {
      if (!room)
        return buildDefaultSections(tab, roomDefaultMode, measurementType);

      const rawTab =
        (tab && String(tab).trim()) ||
        (room.sectionType && String(room.sectionType).trim()) ||
        (Array.isArray(room.measurements) && 'Others') ||
        'Interior';

      const resolvedTab = ['Interior', 'Exterior', 'Others'].includes(rawTab)
        ? rawTab
        : 'Interior';
      const modeFromRoom = room?.mode || MODE.REPAINT;

      if (resolvedTab === 'Interior' || resolvedTab === 'Exterior') {
        const cs = (room.ceilings || []).map((c, i) => ({
          type: 'ceiling',
          width: asStr(c.width),
          height: asStr(c.height),
          windows: (c.windows || []).map(w => ({
            width: asStr(w.width),
            height: asStr(w.height),
          })),
          doors: (c.doors || []).map(d => ({
            width: asStr(d.width),
            height: asStr(d.height),
          })),
          cupboards: (c.cupboards || []).map(u => ({
            width: asStr(u.width),
            height: asStr(u.height),
          })),
          label: `Ceiling ${i + 1}`,
          mode: c.mode || modeFromRoom,
          customMode: false,
        }));

        const ws = (room.walls || []).map((w, i) => ({
          type: 'wall',
          width: asStr(w.width),
          height: asStr(w.height),
          windows: (w.windows || []).map(x => ({
            width: asStr(x.width),
            height: asStr(x.height),
          })),
          doors: (w.doors || []).map(x => ({
            width: asStr(x.width),
            height: asStr(x.height),
          })),
          cupboards: (w.cupboards || []).map(x => ({
            width: asStr(x.width),
            height: asStr(x.height),
          })),
          label: `Wall ${i + 1}`,
          mode: w.mode || modeFromRoom,
          customMode: false,
        }));

        return [...cs, ...ws];
      }

      const mt = (measurementType || '').toLowerCase();
      const fixed = ['door', 'doors', 'grill', 'grills'].includes(mt);

      if (fixed) {
        const key = mt.includes('door') ? 'door' : 'grill';
        return (room.measurements || []).map((m, i) => ({
          type: key,
          width: asStr(m.width),
          height: asStr(m.height),
          label: `${measurementType} ${i + 1}`,
          mode: m.mode || modeFromRoom,
          customMode: false,
        }));
      }

      const cs = (room.ceilings || []).map((c, i) => ({
        type: 'ceiling',
        width: asStr(c.width),
        height: asStr(c.height),
        windows: (c.windows || []).map(w => ({
          width: asStr(w.width),
          height: asStr(w.height),
        })),
        doors: (c.doors || []).map(d => ({
          width: asStr(d.width),
          height: asStr(d.height),
        })),
        cupboards: (c.cupboards || []).map(u => ({
          width: asStr(u.width),
          height: asStr(u.height),
        })),
        label: `Ceiling ${i + 1}`,
        mode: c.mode || modeFromRoom,
        customMode: false,
      }));

      const ws = (room.walls || []).map((w, i) => ({
        type: 'wall',
        width: asStr(w.width),
        height: asStr(w.height),
        windows: (w.windows || []).map(x => ({
          width: asStr(x.width),
          height: asStr(x.height),
        })),
        doors: (w.doors || []).map(x => ({
          width: asStr(x.width),
          height: asStr(x.height),
        })),
        cupboards: (w.cupboards || []).map(x => ({
          width: asStr(x.width),
          height: asStr(x.height),
        })),
        label: `Wall ${i + 1}`,
        mode: w.mode || modeFromRoom,
        customMode: false,
      }));

      return [...cs, ...ws];
    },
    [roomDefaultMode, MODE.REPAINT],
  );

  const normKey = s =>
    String(s || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  const pickRoom = (data, keys) => {
    const rooms = data?.rooms || {};
    for (const k of keys) {
      if (k && rooms[k]) {
        return { room: rooms[k], matchedKey: k };
      }
    }
    const want = normKey(keys.find(Boolean) || '');
    if (!want) return null;
    for (const [name, room] of Object.entries(rooms)) {
      if (normKey(name) === want) {
        return { room, matchedKey: name };
      }
    }
    return null;
  };

  useEffect(() => {
    console.log('Sections Updated: ', sections); // To check if sections are populated
  }, [sections]);

  useEffect(() => {
    if (!etstimateData?.rooms) return;

    const keyCandidates = [nameOfTheRoom, type, rawType].filter(Boolean);
    const picked = pickRoom(etstimateData, keyCandidates);

    if (picked?.room) {
      const hydrated = hydrateFromRoom(
        activeTab,
        picked.room,
        type || 'Grills',
      );
      setRoomDefaultMode(picked.room.mode || MODE.REPAINT);
      setSections(hydrated);
    } else {
      setSections(
        buildDefaultSections(activeTab, MODE.REPAINT, type || 'Grills'),
      );
    }
  }, [etstimateData, nameOfTheRoom, type, rawType, activeTab, hydrateFromRoom]);

  const calculateArea = (w, h) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    return isNaN(width) || isNaN(height) ? 0 : width * height;
  };

  const validateInput = value => {
    if (parseFloat(value) < 0) {
      return 'Negative values are not allowed.';
    }
    return '';
  };

  const onRoomDefaultRepaint = () => {
    setRoomDefaultMode(MODE.REPAINT);
    setSections(prev =>
      prev.map(s => (s.customMode ? s : { ...s, mode: MODE.REPAINT })),
    );
  };

  const onRoomDefaultFresh = () => {
    setRoomDefaultMode(MODE.FRESH);
    setSections(prev =>
      prev.map(s => (s.customMode ? s : { ...s, mode: MODE.FRESH })),
    );
  };

  const setSectionMode = (index, nextMode) => {
    setSections(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, mode: nextMode, customMode: true } : s,
      ),
    );
  };

  const handleWidthChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) => (i === index ? { ...s, width: value } : s)),
    );
  };

  const handleHeightChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) => (i === index ? { ...s, height: value } : s)),
    );
  };

  const handleWindowWidthChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              windows: s.windows.map((w, j) =>
                j === winIndex ? { ...w, width: value } : w,
              ),
            }
          : s,
      ),
    );
  };

  const handleWindowHeightChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              windows: s.windows.map((w, j) =>
                j === winIndex ? { ...w, height: value } : w,
              ),
            }
          : s,
      ),
    );
  };

  const handleDoorWidthChange = (sectionIndex, doorIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              doors: s.doors.map((d, j) =>
                j === doorIndex ? { ...d, width: value } : d,
              ),
            }
          : s,
      ),
    );
  };

  const handleDoorHeightChange = (sectionIndex, doorIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              doors: s.doors.map((d, j) =>
                j === doorIndex ? { ...d, height: value } : d,
              ),
            }
          : s,
      ),
    );
  };

  const handleCupBoardWidthChange = (sectionIndex, cupIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              cupboards: s.cupboards.map((c, j) =>
                j === cupIndex ? { ...c, width: value } : c,
              ),
            }
          : s,
      ),
    );
  };

  const handleCupBoardHeightChange = (sectionIndex, cupIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              cupboards: s.cupboards.map((c, j) =>
                j === cupIndex ? { ...c, height: value } : c,
              ),
            }
          : s,
      ),
    );
  };

  const addCeiling = () => {
    const ceilingCount = sections.filter(s => s.type === 'ceiling').length;
    setSections(prev => [
      ...prev,
      {
        type: 'ceiling',
        width: '',
        height: '',
        windows: [],
        doors: [],
        cupboards: [],
        label: `Ceiling ${ceilingCount + 1}`,
        mode: roomDefaultMode,
        customMode: false,
      },
    ]);
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
  };

  const addWall = () => {
    const wallCount = sections.filter(s => s.type === 'wall').length;
    setSections(prev => [
      ...prev,
      {
        type: 'wall',
        width: '',
        height: '',
        windows: [],
        doors: [],
        cupboards: [],
        label: `Wall ${wallCount + 1}`,
        mode: roomDefaultMode,
        customMode: false,
      },
    ]);
  };

  const addWindow = sectionIndex => {
    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, windows: [...s.windows, { width: '', height: '' }] }
          : s,
      ),
    );
  };

  const addDoor = sectionIndex => {
    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, doors: [...s.doors, { width: '', height: '' }] }
          : s,
      ),
    );
  };

  const addCupBoard = sectionIndex => {
    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, cupboards: [...s.cupboards, { width: '', height: '' }] }
          : s,
      ),
    );
  };

  const addOtherItem = () => {
    const count = sections.filter(s => s.type === normalizeType(type)).length;
    setSections(prev => [
      ...prev,
      {
        type: normalizeType(type),
        width: '',
        height: '',
        mode: roomDefaultMode,
        customMode: false,
        label: `${type} ${count + 1}`,
      },
    ]);
  };

  const transformToBackendStructure = (
    roomName,
    sections,
    sectionType = activeTab,
  ) => {
    const roomMode = roomDefaultMode;
    const tab = (sectionType || '').trim();

    const toNumber = v => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const area2 = (w, h) => +(toNumber(w) * toNumber(h)).toFixed(2);
    const validRect = (w, h) => {
      const W = toNumber(w),
        H = toNumber(h);
      return W > 0 && H > 0;
    };

    const mapOpenings = (arr = []) =>
      arr.map(o => ({
        width: toNumber(o.width),
        height: toNumber(o.height),
        area: +(toNumber(o.width) * toNumber(o.height)).toFixed(2),
      }));

    const mapCeilingWall = s => {
      const width = toNumber(s.width);
      const height = toNumber(s.height);
      const gross = area2(width, height);
      const openings = [
        ...(s.windows || []),
        ...(s.doors || []),
        ...(s.cupboards || []),
      ];
      const openingsArea = openings.reduce(
        (sum, o) => sum + toNumber(o.area),
        0,
      );
      const net = Math.max(gross - openingsArea, 0).toFixed(2);

      return {
        width,
        height,
        area: gross,
        totalSqt: +net,
        windows: mapOpenings(s.windows),
        doors: mapOpenings(s.doors),
        cupboards: mapOpenings(s.cupboards),
        mode: s.mode || MODE.REPAINT,
      };
    };

    if (tab === 'Interior') {
      const ceilings = sections
        .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
        .map(mapCeilingWall);

      const walls = sections
        .filter(s => s.type === 'wall' && validRect(s.width, s.height))
        .map(mapCeilingWall);

      if (ceilings.length === 0 && walls.length === 0) return { rooms: {} };

      return {
        rooms: {
          [roomName]: {
            mode: roomMode,
            unit: 'FT',
            sectionType: 'Interior',
            ceilings,
            walls,
          },
        },
      };
    }

    if (tab === 'Exterior') {
      const mapExt = s => ({
        width: toNumber(s.width),
        height: toNumber(s.height),
        area: area2(s.width, s.height),
        totalSqt: area2(s.width, s.height),
        windows: [],
        doors: [],
        cupboards: [],
        mode: s.mode || MODE.REPAINT,
      });

      const ceilings = sections
        .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
        .map(mapExt);

      const walls = sections
        .filter(s => s.type === 'wall' && validRect(s.width, s.height))
        .map(mapExt);

      if (ceilings.length === 0 && walls.length === 0) return { rooms: {} };

      return {
        rooms: {
          [roomName]: {
            mode: roomMode,
            unit: 'FT',
            sectionType: 'Exterior',
            ceilings,
            walls,
          },
        },
      };
    }

    const mt = (roomName || '').toLowerCase();
    const fixed = ['doors', 'grills'].includes(mt);
    if (fixed) {
      const measurements = sections
        .filter(s => validRect(s.width, s.height))
        .map(s => ({
          width: toNumber(s.width),
          height: toNumber(s.height),
          area: area2(s.width, s.height),
          totalSqt: area2(s.width, s.height),
          mode: s.mode || MODE.REPAINT,
        }));

      if (measurements.length === 0) return { rooms: {} };

      return {
        rooms: {
          [roomName]: {
            mode: roomMode,
            unit: 'FT',
            sectionType: 'Others',
            measurements,
          },
        },
      };
    }

    const ceilings = sections
      .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
      .map(mapCeilingWall);

    const walls = sections
      .filter(s => s.type === 'wall' && validRect(s.width, s.height))
      .map(mapCeilingWall);

    if (ceilings.length === 0 && walls.length === 0) return { rooms: {} };

    return {
      rooms: {
        [roomName]: {
          mode: roomMode,
          unit: 'FT',
          sectionType: 'Others',
          ceilings,
          walls,
        },
      },
    };
  };

  const roomKeyToSave = nameOfTheRoom?.trim() || type;
  const transformedData = transformToBackendStructure(
    roomKeyToSave,
    sections,
    activeTab,
  );

  const handleCheck = async () => {
    const roomKeyToSave = nameOfTheRoom?.trim() || type;
    const sanitized = transformToBackendStructure(
      roomKeyToSave,
      sections,
      activeTab,
    );

    if (!sanitized.rooms || Object.keys(sanitized.rooms).length === 0) {
      Alert.alert(
        'No measurements',
        'Enter at least one Ceiling/Wall with valid length and width.',
      );
      return;
    }

    try {
      const payload = {
        vendorId: vendorDataContext._id,
        leadId: leadDataContext._id,
        rooms: sanitized.rooms,
        previousRoomName: type,
        newRoomName: roomKeyToSave,
      };

      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SAVE_MEASUREMENTS}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      setEstimateData(data.data);

      navigation.navigate({
        name: 'StartMeasurement',
        params: {
          rename: {
            tab: activeTab,
            from: type,
            to: roomKeyToSave,
          },
        },
        merge: true,
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" color="black" size={23} />
          </TouchableOpacity>
          <TextInput
            value={nameOfTheRoom}
            onChangeText={setNameOfTheRoom}
            style={styles.roomNameInput}
            placeholder="Enter room name"
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        key={nameOfTheRoom || type}
      >
        <View style={{ marginBottom: 80 }}>
          {/* Interior & Room-Like */}
          {isRoomLike && activeTab !== 'Exterior' && (
            <>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={onRoomDefaultRepaint}
                >
                  <View
                    style={[
                      styles.checkbox,
                      roomDefaultMode === MODE.REPAINT &&
                        styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomDefaultMode === MODE.REPAINT &&
                        styles.checkboxLabelSelected,
                    ]}
                  >
                    Repaint with Primer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={onRoomDefaultFresh}
                >
                  <View
                    style={[
                      styles.checkbox,
                      roomDefaultMode === MODE.FRESH && styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomDefaultMode === MODE.FRESH &&
                        styles.checkboxLabelSelected,
                    ]}
                  >
                    Fresh Paint
                  </Text>
                </TouchableOpacity>
              </View>

              {sections.map((section, index) =>
                section.type === 'ceiling' ? (
                  <View key={`ceiling-${index}`} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height) -
                          (section.windows || [])
                            .concat(section.doors || [])
                            .concat(section.cupboards || [])
                            .reduce(
                              (sum, win) =>
                                sum + calculateArea(win.width, win.height),
                              0,
                            )}{' '}
                        sq ft
                      </Text>
                    </View>
                    <View style={styles.underlineRed} />
                    <View style={styles.radioRow}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setSectionMode(index, MODE.REPAINT)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            section.mode === MODE.REPAINT &&
                              styles.checkboxSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.checkboxLabel,
                            section.mode === MODE.REPAINT &&
                              styles.checkboxLabelSelected,
                          ]}
                        >
                          Repaint
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setSectionMode(index, MODE.FRESH)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            section.mode === MODE.FRESH &&
                              styles.checkboxSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.checkboxLabel,
                            section.mode === MODE.FRESH &&
                              styles.checkboxLabelSelected,
                          ]}
                        >
                          Fresh
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput
                        placeholder="L"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.width}
                        onChangeText={text => handleWidthChange(index, text)}
                      />
                      <Text style={styles.multiply}>×</Text>
                      <TextInput
                        placeholder="W"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.height}
                        onChangeText={text => handleHeightChange(index, text)}
                      />
                      <Text style={styles.equalSign}>=</Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height)}
                      </Text>
                    </View>

                    {/* Windows */}
                    {section.windows?.map((win, winIndex) => (
                      <View
                        key={`window-${index}-${winIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          Window {winIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={win.width}
                            onChangeText={text =>
                              handleWindowWidthChange(index, winIndex, text)
                            }
                          />
                          <Text style={styles.multiply}>×</Text>
                          <TextInput
                            placeholder="W"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={win.height}
                            onChangeText={text =>
                              handleWindowHeightChange(index, winIndex, text)
                            }
                          />
                          <Text style={styles.equalSign}>=</Text>
                          <Text style={styles.areaText}>
                            {calculateArea(win.width, win.height)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Doors */}
                    {section.doors?.map((dr, doorIndex) => (
                      <View
                        key={`door-${index}-${doorIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          Opening {doorIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={dr.width}
                            onChangeText={text =>
                              handleDoorWidthChange(index, doorIndex, text)
                            }
                          />
                          <Text style={styles.multiply}>×</Text>
                          <TextInput
                            placeholder="W"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={dr.height}
                            onChangeText={text =>
                              handleDoorHeightChange(index, doorIndex, text)
                            }
                          />
                          <Text style={styles.equalSign}>=</Text>
                          <Text style={styles.areaText}>
                            {calculateArea(dr.width, dr.height)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Cupboards */}
                    {section.cupboards?.map((cup, cupIndex) => (
                      <View
                        key={`cupboard-${index}-${cupIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          Cupboard {cupIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={cup.width}
                            onChangeText={text =>
                              handleCupBoardWidthChange(index, cupIndex, text)
                            }
                          />
                          <Text style={styles.multiply}>×</Text>
                          <TextInput
                            placeholder="W"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={cup.height}
                            onChangeText={text =>
                              handleCupBoardHeightChange(index, cupIndex, text)
                            }
                          />
                          <Text style={styles.equalSign}>=</Text>
                          <Text style={styles.areaText}>
                            {calculateArea(cup.width, cup.height)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.underlineRed} />
                    <View style={styles.iconRow}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => addWindow(index)}
                      >
                        <Ionicons name="add-circle" size={15} color="#4CAF50" />
                        <Text style={styles.iconCheck}> Window</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => addDoor(index)}
                      >
                        <Ionicons name="add-circle" size={15} color="#4CAF50" />
                        <Text style={styles.iconCheck}> Opening</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => addCupBoard(index)}
                      >
                        <Ionicons name="add-circle" size={15} color="#4CAF50" />
                        <Text style={styles.iconCheck}> Cupboard</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View key={`wall-${index}`} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height) -
                          (section.windows || [])
                            .concat(section.doors || [])
                            .concat(section.cupboards || [])
                            .reduce(
                              (sum, win) =>
                                sum + calculateArea(win.width, win.height),
                              0,
                            )}{' '}
                        sq ft
                      </Text>
                    </View>
                    <View style={styles.underlineRed} />
                    <View style={styles.radioRow}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setSectionMode(index, MODE.REPAINT)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            section.mode === MODE.REPAINT &&
                              styles.checkboxSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.checkboxLabel,
                            section.mode === MODE.REPAINT &&
                              styles.checkboxLabelSelected,
                          ]}
                        >
                          Repaint
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setSectionMode(index, MODE.FRESH)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            section.mode === MODE.FRESH &&
                              styles.checkboxSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.checkboxLabel,
                            section.mode === MODE.FRESH &&
                              styles.checkboxLabelSelected,
                          ]}
                        >
                          Fresh
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput
                        placeholder="L"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.width}
                        onChangeText={text => handleWidthChange(index, text)}
                      />
                      <Text style={styles.multiply}>×</Text>
                      <TextInput
                        placeholder="W"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.height}
                        onChangeText={text => handleHeightChange(index, text)}
                      />
                      <Text style={styles.equalSign}>=</Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height)}
                      </Text>
                    </View>

                    {/* Windows */}
                    {section.windows?.map((win, winIndex) => (
                      <View
                        key={`window-${index}-${winIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          Window {winIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={win.width}
                            onChangeText={text =>
                              handleWindowWidthChange(index, winIndex, text)
                            }
                          />
                          <Text style={styles.multiply}>×</Text>
                          <TextInput
                            placeholder="W"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={win.height}
                            onChangeText={text =>
                              handleWindowHeightChange(index, winIndex, text)
                            }
                          />
                          <Text style={styles.equalSign}>=</Text>
                          <Text style={styles.areaText}>
                            {calculateArea(win.width, win.height)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Doors */}
                    {section.doors?.map((dr, doorIndex) => (
                      <View
                        key={`door-${index}-${doorIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          Door {doorIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={dr.width}
                            onChangeText={text =>
                              handleDoorWidthChange(index, doorIndex, text)
                            }
                          />
                          <Text style={styles.multiply}>×</Text>
                          <TextInput
                            placeholder="W"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={dr.height}
                            onChangeText={text =>
                              handleDoorHeightChange(index, doorIndex, text)
                            }
                          />
                          <Text style={styles.equalSign}>=</Text>
                          <Text style={styles.areaText}>
                            {calculateArea(dr.width, dr.height)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Cupboards */}
                    {section.cupboards?.map((cup, cupIndex) => (
                      <View
                        key={`cupboard-${index}-${cupIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          Cupboard {cupIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={cup.width}
                            onChangeText={text =>
                              handleCupBoardWidthChange(index, cupIndex, text)
                            }
                          />
                          <Text style={styles.multiply}>×</Text>
                          <TextInput
                            placeholder="W"
                            placeholderTextColor="gray"
                            style={styles.input}
                            keyboardType="numeric"
                            value={cup.height}
                            onChangeText={text =>
                              handleCupBoardHeightChange(index, cupIndex, text)
                            }
                          />
                          <Text style={styles.equalSign}>=</Text>
                          <Text style={styles.areaText}>
                            {calculateArea(cup.width, cup.height)}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.underlineRed} />
                    <View style={styles.iconRow}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => addWindow(index)}
                      >
                        <Ionicons name="add-circle" size={15} color="#4CAF50" />
                        <Text style={styles.iconCheck}> Window</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => addDoor(index)}
                      >
                        <Ionicons name="add-circle" size={15} color="#4CAF50" />
                        <Text style={styles.iconCheck}> Door</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => addCupBoard(index)}
                      >
                        <Ionicons name="add-circle" size={15} color="#4CAF50" />
                        <Text style={styles.iconCheck}> Cupboard</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ),
              )}
              <TouchableOpacity
                onPress={addCeiling}
                style={styles.sectionButton}
              >
                <Text style={styles.sectionButtonText}>Add Ceiling</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={addWall} style={styles.sectionButton}>
                <Text style={styles.sectionButtonText}>Add Wall</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>
            </>
          )}
          {/* Exterior */}
          {activeTab === 'Exterior' && (
            <>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={onRoomDefaultRepaint}
                >
                  <View
                    style={[
                      styles.checkbox,
                      roomDefaultMode === MODE.REPAINT &&
                        styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomDefaultMode === MODE.REPAINT &&
                        styles.checkboxLabelSelected,
                    ]}
                  >
                    Repaint with Primer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={onRoomDefaultFresh}
                >
                  <View
                    style={[
                      styles.checkbox,
                      roomDefaultMode === MODE.FRESH && styles.checkboxSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxLabel,
                      roomDefaultMode === MODE.FRESH &&
                        styles.checkboxLabelSelected,
                    ]}
                  >
                    Fresh Paint
                  </Text>
                </TouchableOpacity>
              </View>

              {sections.map((section, index) => (
                <View key={`ext-${index}`} style={styles.section}>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                  <View style={styles.underlineRed} />
                  <View style={styles.radioRow}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setSectionMode(index, MODE.REPAINT)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          section.mode === MODE.REPAINT &&
                            styles.checkboxSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.checkboxLabel,
                          section.mode === MODE.REPAINT &&
                            styles.checkboxLabelSelected,
                        ]}
                      >
                        Repaint
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setSectionMode(index, MODE.FRESH)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          section.mode === MODE.FRESH &&
                            styles.checkboxSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.checkboxLabel,
                          section.mode === MODE.FRESH &&
                            styles.checkboxLabelSelected,
                        ]}
                      >
                        Fresh
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="L"
                      placeholderTextColor="gray"
                      style={styles.input}
                      keyboardType="numeric"
                      value={section.width}
                      onChangeText={text => handleWidthChange(index, text)}
                    />
                    <Text style={styles.multiply}>×</Text>
                    <TextInput
                      placeholder="W"
                      placeholderTextColor="gray"
                      style={styles.input}
                      keyboardType="numeric"
                      value={section.height}
                      onChangeText={text => handleHeightChange(index, text)}
                    />
                    <Text style={styles.equalSign}>=</Text>
                    <Text style={styles.areaText}>
                      {calculateArea(section.width, section.height)}
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={addCeiling}
                style={styles.sectionButton}
              >
                <Text style={styles.sectionButtonText}>Add Ceiling</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={addWall} style={styles.sectionButton}>
                <Text style={styles.sectionButtonText}>Add Wall</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>
            </>
          )}
          {/* Others (Doors/Grills) */}
          {activeTab === 'Others' && isFixedOthers && (
            <>
              {sections.map((section, index) => (
                <View key={`other-${index}`} style={styles.section}>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                  <View style={styles.underlineRed} />
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="L"
                      placeholderTextColor="gray"
                      style={styles.input}
                      keyboardType="numeric"
                      value={section.width}
                      onChangeText={text => handleWidthChange(index, text)}
                    />
                    <Text style={styles.multiply}>×</Text>
                    <TextInput
                      placeholder="W"
                      placeholderTextColor="gray"
                      style={styles.input}
                      keyboardType="numeric"
                      value={section.height}
                      onChangeText={text => handleHeightChange(index, text)}
                    />
                    <Text style={styles.equalSign}>=</Text>
                    <Text style={styles.areaText}>
                      {calculateArea(section.width, section.height)}
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={addOtherItem}
                style={styles.sectionButton}
              >
                <Text style={styles.sectionButtonText}>{`Add ${type}`}</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.doneButton} onPress={handleCheck}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
};

export default RoomMeasurementScreen;

// Styles (unchanged)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomColor: '#e9e9e9',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  roomNameInput: {
    paddingHorizontal: 33,
    color: '#232323',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    marginTop: 5,
  },
  scrollContent: { paddingVertical: 10, paddingHorizontal: 15 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#ED1F24',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  areaText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 3,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioOption: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ED1F24',
    marginRight: 8,
  },
  checkboxSelected: { backgroundColor: '#ED1F24' },
  checkboxLabel: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  checkboxLabelSelected: { color: '#000000' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ED1F24',
    paddingHorizontal: 10,
    width: 80,
    borderRadius: 5,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  multiply: { fontSize: 16, color: '#000000', marginHorizontal: 5 },
  equalSign: { fontSize: 16, color: '#000', marginHorizontal: 5 },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: { flexDirection: 'row', alignItems: 'center' },
  iconCheck: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 3,
  },
  windowSection: { marginVertical: 10, paddingLeft: 10 },
  windowLabel: {
    fontSize: 13,
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  sectionButtonText: {
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  doneButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  underlineRed: {
    borderBottomColor: '#ED1F24',
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#ED1F24',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
});
