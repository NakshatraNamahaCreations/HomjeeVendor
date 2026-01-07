import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../../Utilities/ThemeContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../../ApiService/apiConstants';
import { getRequest, postRequest } from '../../../ApiService/apiHelper';
import { useLeadContext } from '../../../Utilities/LeadContext';
import { useVendorContext } from '../../../Utilities/VendorContext';
import { useEstimateContext } from '../../../Utilities/EstimateContext';
import { useRoomNameContext } from '../../../Utilities/RoomContext';

const RoomMeasurementScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const MODE = { REPAINT: 'REPAINT', FRESH: 'FRESH' };
  const { deviceTheme } = useThemeColor();
  const scrollViewRef = useRef(null);
  const { leadDataContext } = useLeadContext();
  const { vendorDataContext } = useVendorContext();
  const { nameOfTheRoom, setNameOfTheRoom } = useRoomNameContext();
  const hydratedOnceRef = useRef(false);
  const { type, activeTab } = route.params;
  const rawType = route?.params?.type;
  const [error, setError] = useState('');
  const [roomRepaint, setRoomRepaint] = useState(true);
  const [roomFresh, setRoomFresh] = useState(false);
  const [etstimateData, setEstimateData] = useEstimateContext();
  const [inputEpoch, setInputEpoch] = useState(0); // forces TextInput remounts
  const hydratedKeyRef = useRef(null);

  const normalizeType = (v, fallback = 'grill') => {
    if (typeof v === 'string') {
      const s = v.trim();
      if (s) return s.toLowerCase();
    }
    return fallback;
  };

  useEffect(() => {
    console.log('etstimateData:', JSON.stringify(etstimateData, null, 2));
  }, [etstimateData]);

  const isFixedOthers =
    activeTab === 'Others' &&
    ['doors', 'grills'].includes((type || '').trim().toLowerCase());

  // Reuse "room-like" UI for Interior, Exterior, and Others custom rooms
  const isRoomLike =
    activeTab === 'Interior' ||
    activeTab === 'Exterior' ||
    (activeTab === 'Others' && !isFixedOthers);

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
      const key = normalizeType(t ?? measurementType, 'grill'); // safe
      return {
        type: key, // 'grill' | 'door' | ...
        width: '',
        height: '',
        label,
        mode: defaultMode,
        customMode: false,
      };
    };
    switch ((tab || '').trim()) {
      case 'Interior': {
        const ceiling = makeCeiling('Ceiling 1');
        const walls = Array.from({ length: 4 }, (_, i) =>
          makeWall(`Wall ${i + 1}`),
        );
        return [ceiling, ...walls];
      }
      case 'Exterior': {
        // 1 ceiling + 2 walls
        return [
          makeCeiling('Ceiling 1'),
          makeWall('Wall 1'),
          makeWall('Wall 2'),
          makeWall('Wall 3'), // remove if doesn't need by commanding
          makeWall('Wall 4'),
        ];
      }
      case 'Others': {
        // 4 items of the given type
        // return Array.from({ length: 4 }, (_, i) =>
        //   makeOther(`${measurementType} ${i + 1}`),
        // );
        if (isFixedOthers) {
          // "Doors" / "Grills" behave like the old Others measurements
          return Array.from({ length: 4 }, (_, i) =>
            makeOther(`${measurementType} ${i + 1}`),
          );
        }
        // Custom Others room behaves like Interior: 1 ceiling + 4 walls
        const ceiling = makeCeiling('Ceiling 1');
        const walls = Array.from({ length: 4 }, (_, i) =>
          makeWall(`Wall ${i + 1}`),
        );
        return [ceiling, ...walls];
      }
      default:
        return [];
    }
  };

  const [roomDefaultMode, setRoomDefaultMode] = useState(MODE.REPAINT);
  const [sections, setSections] = useState(() =>
    buildDefaultSections(activeTab, MODE.REPAINT, type ?? 'Grills'),
  );

  // Try multiple keys and do a normalized match if direct hit fails
  const getRoomByAnyKey = (data, keys) => {
    const rooms = data?.rooms || {};
    // 1) exact hits first
    for (const k of keys) {
      if (k && rooms[k]) return rooms[k];
    }
    // 2) normalized fallback
    const wanted = normKey(keys.find(Boolean) || '');
    if (!wanted) return null;
    for (const [name, room] of Object.entries(rooms)) {
      if (normKey(name) === wanted) return room;
    }
    return null;
  };

  const calculateArea = (w, h) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    return isNaN(width) || isNaN(height) ? 0 : width * height;
  };

  const validateInput = value => {
    if (parseFloat(value) < 0) {
      return 'Negative values in measurement calculations; display a validation warning.';
    }
    return '';
  };

  const asStr = v => (v === 0 || v === '0' ? '0' : (v ?? '') + '');

  const hydrateFromRoom = useCallback(
    (tab, room, measurementType) => {
      if (!room)
        return buildDefaultSections(tab, roomDefaultMode, measurementType);

      // ← KEY FIX: resolve tab if activeTab is missing/stale
      const rawTab =
        (tab && String(tab).trim()) ||
        (room.sectionType && String(room.sectionType).trim()) ||
        // last fallback: infer from data shape
        (Array.isArray(room.measurements) && 'Others') ||
        'Interior';

      const resolvedTab =
        rawTab === 'Interior' || rawTab === 'Exterior' || rawTab === 'Others'
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

      // Others
      // const key = (measurementType || 'Grills').toLowerCase();
      // return (room.measurements || []).map((m, i) => ({
      //   type: key,
      //   width: asStr(m.width),
      //   height: asStr(m.height),
      //   label: `${measurementType} ${i + 1}`,
      //   mode: m.mode || modeFromRoom,
      //   customMode: false,
      // }));
      // Others: fixed vs custom
      const mt = (measurementType || '').toLowerCase();
      const fixed = ['door', 'doors', 'grill', 'grills'].includes(mt);
      if (fixed) {
        const key = mt.includes('door') ? 'door' : 'grill';
        return (room.measurements || []).map((m, i) => ({
          type: key,
          width: String(m.width ?? ''),
          height: String(m.height ?? ''),
          label: `${measurementType} ${i + 1}`,
          mode: m.mode || modeFromRoom,
          customMode: false,
        }));
      }
      // Custom Others = room-like (ceilings + walls)
      const cs = (room.ceilings || []).map((c, i) => ({
        type: 'ceiling',
        width: String(c.width ?? ''),
        height: String(c.height ?? ''),
        windows: (c.windows || []).map(w => ({
          width: String(w.width ?? ''),
          height: String(w.height ?? ''),
        })),
        doors: (c.doors || []).map(d => ({
          width: String(d.width ?? ''),
          height: String(d.height ?? ''),
        })),
        cupboards: (c.cupboards || []).map(u => ({
          width: String(u.width ?? ''),
          height: String(u.height ?? ''),
        })),
        label: `Ceiling ${i + 1}`,
        mode: c.mode || modeFromRoom,
        customMode: false,
      }));
      const ws = (room.walls || []).map((w, i) => ({
        type: 'wall',
        width: String(w.width ?? ''),
        height: String(w.height ?? ''),
        windows: (w.windows || []).map(x => ({
          width: String(x.width ?? ''),
          height: String(x.height ?? ''),
        })),
        doors: (w.doors || []).map(x => ({
          width: String(x.width ?? ''),
          height: String(x.height ?? ''),
        })),
        cupboards: (w.cupboards || []).map(x => ({
          width: String(x.width ?? ''),
          height: String(x.height ?? ''),
        })),
        label: `Wall ${i + 1}`,
        mode: w.mode || modeFromRoom,
        customMode: false,
      }));
      return [...cs, ...ws];
    },
    [MODE.REPAINT, roomDefaultMode],
  );

  const normKey = s =>
    String(s || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  const pickRoom = (data, keys) => {
    console.log('pickRoom keys:', keys);
    const rooms = data?.rooms || {};
    for (const k of keys) {
      if (k && rooms[k]) {
        console.log('Exact match found:', k);
        return { room: rooms[k], matchedKey: k, matchedBy: 'exact' };
      }
    }
    const want = normKey(keys.find(Boolean) || '');
    if (!want) return null;
    for (const [name, room] of Object.entries(rooms)) {
      if (normKey(name) === want) {
        console.log('Normalized match found:', name);
        return { room, matchedKey: name, matchedBy: 'normalized' };
      }
    }
    console.log('No room matched for keys:', keys);
    return null;
  };

  useEffect(() => {
    const roomsReady = !!etstimateData?.rooms;
    if (!roomsReady) return;

    const keyCandidates = [nameOfTheRoom, type, route?.params?.type];
    const picked = pickRoom(etstimateData, keyCandidates);
    if (!picked?.room) {
      console.log('[hydrate] NO MATCH', {
        keyCandidates,
        have: Object.keys(etstimateData.rooms),
      });
      return;
    }

    const hydrated = hydrateFromRoom(activeTab, picked.room, type || 'Grills');
    console.log('Hydrated sections:', JSON.stringify(hydrated, null, 2));
    setRoomDefaultMode(picked.room.mode || MODE.REPAINT);
    setSections(hydrated);
    hydratedKeyRef.current = picked.matchedKey;
    setInputEpoch(e => e + 1);
  }, [
    etstimateData,
    nameOfTheRoom,
    type,
    activeTab,
    route?.params?.type,
    hydrateFromRoom,
  ]);

  console.log('Sections state:', JSON.stringify(sections, null, 2));

  const applyDefaultToNonCustomized = nextMode => {
    setSections(prev =>
      prev.map(s => (s.customMode ? s : { ...s, mode: nextMode })),
    );
  };

  const onRoomDefaultRepaint = () => {
    setRoomDefaultMode(MODE.REPAINT);
    applyDefaultToNonCustomized(MODE.REPAINT);
  };

  const onRoomDefaultFresh = () => {
    setRoomDefaultMode(MODE.FRESH);
    applyDefaultToNonCustomized(MODE.FRESH);
  };

  const setSectionMode = (index, nextMode) => {
    setSections(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, mode: nextMode, customMode: true } : s,
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
          ? { ...s, windows: [...(s.windows || []), { width: '', height: '' }] }
          : s,
      ),
    );
  };

  const addDoor = sectionIndex => {
    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, doors: [...(s.doors || []), { width: '', height: '' }] }
          : s,
      ),
    );
  };
  const addCupBoard = sectionIndex => {
    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              cupboards: [...(s.cupboards || []), { width: '', height: '' }],
            }
          : s,
      ),
    );
  };

  const addExteriorWall = () => {
    const wallCount = sections.filter(s => s.type === 'wall').length;
    setSections(prev => [
      ...prev,
      {
        type: 'wall',
        width: '',
        height: '',
        mode: roomDefaultMode,
        customMode: false,
        label: `Wall ${wallCount + 1}`,
      },
    ]);
  };

  // optional
  const addExteriorCeiling = () => {
    const ceilCount = sections.filter(s => s.type === 'ceiling').length;
    setSections(prev => [
      ...prev,
      {
        type: 'ceiling',
        width: '',
        height: '',
        mode: roomDefaultMode,
        customMode: false,
        label: `Ceiling ${ceilCount + 1}`,
      },
    ]);
  };

  const addExteriorItem = () => {
    const key = (type || 'Wall').toLowerCase(); // allow adding “Wall” or “Ceiling” if you pass that as type
    const count = sections.filter(s => s.type === key).length;
    setSections(prev => [
      ...prev,
      {
        type: key,
        width: '',
        height: '',
        mode: roomDefaultMode,
        customMode: false,
        label: `${type || 'Wall'} ${count + 1}`,
      },
    ]);
  };

  const addOtherItem = () => {
    const key = (type || 'Grills').toLowerCase();
    const count = sections.filter(s => s.type === key).length;
    setSections(prev => [
      ...prev,
      {
        type: key,
        width: '',
        height: '',
        mode: roomDefaultMode,
        customMode: false,
        label: `${type || 'Grills'} ${count + 1}`,
      },
    ]);
  };

  const syncSectionStates = useCallback(() => {
    const updatedSections = sections.map(s => ({
      ...s,
      repaint: roomRepaint,
      fresh: roomFresh,
    }));
    setSections(updatedSections);
  }, [roomRepaint, roomFresh]);

  useEffect(() => {
    syncSectionStates();
  }, [syncSectionStates]);

  const handleWidthChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[index].width = value;
    setSections(updated);
  };

  const handleHeightChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[index].height = value;
    setSections(updated);
  };

  const handleWindowWidthChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[sectionIndex].windows[winIndex].width = value;
    setSections(updated);
  };

  const handleWindowHeightChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[sectionIndex].windows[winIndex].height = value;
    setSections(updated);
  };

  const handleDoorWidthChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[sectionIndex].doors[winIndex].width = value;
    setSections(updated);
  };

  const handleDoorHeightChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[sectionIndex].doors[winIndex].height = value;
    setSections(updated);
  };

  const handleCupBoardWidthChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[sectionIndex].cupboards[winIndex].width = value;
    setSections(updated);
  };

  const handleCupBoardHeightChange = (sectionIndex, winIndex, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    const updated = [...sections];
    updated[sectionIndex].cupboards[winIndex].height = value;
    setSections(updated);
  };

  const toNumber = value => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const area2 = (w, h) => +(toNumber(w) * toNumber(h)).toFixed(2);

  const validRect = (w, h) => {
    const W = parseFloat(w),
      H = parseFloat(h);
    return Number.isFinite(W) && Number.isFinite(H) && W > 0 && H > 0;
  };

  const transformToBackendStructure = (
    roomName,
    sections,
    sectionType = activeTab, // 'Interior' | 'Exterior' | 'Others'
    unit = 'FT',
  ) => {
    const roomMode = roomDefaultMode;
    const tab = (sectionType || '').trim();

    const toNumber = v => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };
    const area2 = (w, h) => +(toNumber(w) * toNumber(h)).toFixed(2);

    // builders shared across section types
    const mapOpenings = (arr = []) =>
      arr.map(o => {
        const w = toNumber(o.width);
        const h = toNumber(o.height);
        return { width: w, height: h, area: +(w * h).toFixed(2) };
      });

    const mapCeilingInteriorLike = s => {
      const width = toNumber(s.width);
      const height = toNumber(s.height);
      const windows = mapOpenings(s.windows);
      const doors = mapOpenings(s.doors);
      const cupboards = mapOpenings(s.cupboards);
      const gross = area2(width, height);
      const openingsArea = [...windows, ...doors, ...cupboards].reduce(
        (sum, o) => sum + toNumber(o.area),
        0,
      );
      const net = +Math.max(gross - openingsArea, 0).toFixed(2);
      return {
        width,
        height,
        area: gross,
        totalSqt: net,
        windows,
        doors,
        cupboards,
        mode: s.mode || MODE.REPAINT,
      };
    };

    const mapWallInteriorLike = mapCeilingInteriorLike;

    // 1) INTERIOR: net = gross - openings; skip empty
    if (tab === 'Interior') {
      const ceilings = sections
        .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
        .map(mapCeilingInteriorLike);

      const walls = sections
        .filter(s => s.type === 'wall' && validRect(s.width, s.height))
        .map(mapWallInteriorLike);

      if (ceilings.length === 0 && walls.length === 0) {
        return { rooms: {} }; // nothing to save
      }

      return {
        rooms: {
          [roomName]: {
            mode: roomMode,
            unit,
            sectionType: 'Interior',
            ceilings,
            walls,
          },
        },
      };
    }

    // 2) EXTERIOR: net == gross; skip empty
    if (tab === 'Exterior') {
      const mapExt = s => {
        const width = toNumber(s.width);
        const height = toNumber(s.height);
        const gross = area2(width, height);
        return {
          width,
          height,
          area: gross,
          totalSqt: gross,
          windows: [],
          doors: [],
          cupboards: [],
          mode: s.mode || MODE.REPAINT,
        };
      };

      const ceilings = sections
        .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
        .map(mapExt);

      const walls = sections
        .filter(s => s.type === 'wall' && validRect(s.width, s.height))
        .map(mapExt);

      if (ceilings.length === 0 && walls.length === 0) {
        return { rooms: {} };
      }

      return {
        rooms: {
          [roomName]: {
            mode: roomMode,
            unit,
            sectionType: 'Exterior',
            ceilings,
            walls,
          },
        },
      };
    }

    // 3) OTHERS
    const mt = (roomName || '').toLowerCase();
    const fixed = ['doors', 'grills'].includes(mt);

    if (fixed) {
      // legacy Doors/Grills measurements; skip empty
      const measurements = sections
        .filter(s => validRect(s.width, s.height))
        .map(s => {
          const width = toNumber(s.width);
          const height = toNumber(s.height);
          const gross = area2(width, height);
          return {
            width,
            height,
            area: gross,
            totalSqt: gross,
            mode: s.mode || MODE.REPAINT,
          };
        });

      if (measurements.length === 0) return { rooms: {} };

      return {
        rooms: {
          [roomName]: {
            mode: roomMode,
            unit,
            sectionType: 'Others',
            measurements,
          },
        },
      };
    }

    // Custom Others → act like Interior with openings; skip empty
    const ceilings = sections
      .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
      .map(mapCeilingInteriorLike);

    const walls = sections
      .filter(s => s.type === 'wall' && validRect(s.width, s.height))
      .map(mapWallInteriorLike);

    if (ceilings.length === 0 && walls.length === 0) {
      return { rooms: {} };
    }

    return {
      rooms: {
        [roomName]: {
          mode: roomMode,
          unit,
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

  const validateBeforeSave = () => {
    if (!isRoomLike) return true; // skip for Doors/Grills list
    const bad = sections.find(
      s =>
        (s.type === 'ceiling' || s.type === 'wall') &&
        (!`${s.width}`.trim() ||
          !`${s.height}`.trim() ||
          isNaN(parseFloat(s.width)) ||
          isNaN(parseFloat(s.height)) ||
          parseFloat(s.width) <= 0 ||
          parseFloat(s.height) <= 0),
    );
    if (bad) {
      Alert.alert(
        'Missing dimensions',
        'Please enter length and width for all ceilings and walls before saving.',
      );
      return false;
    }
    return true;
  };

  const handleCheck = async () => {
    if (!validateBeforeSave()) return;

    const roomKeyToSave = nameOfTheRoom?.trim() || type;
    const sanitized = transformToBackendStructure(
      roomKeyToSave,
      sections,
      activeTab,
    );

    // If nothing to save, stop here
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

      // Navigate back and update name list only if we actually saved
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
      <View
        style={{
          backgroundColor: 'white',
          paddingVertical: 8,
          paddingHorizontal: 15,
          borderBottomColor: '#e9e9e9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" color="black" size={23} />
          </TouchableOpacity>
          <TextInput
            value={nameOfTheRoom}
            onChangeText={txt => setNameOfTheRoom(txt)}
            style={{
              paddingHorizontal: 33,
              color: '#232323',
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
              marginTop: 5,
            }}
          />
        </View>
      </View>
      <View style={{ paddingTop: 2, marginBottom: 150 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
        >
          {/* {activeTab === 'Interior' ? ( */}
          {isRoomLike && activeTab !== 'Exterior' ? (
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
                      <Text style={styles.sectionLabel}>
                        {section.label || `Ceiling ${index + 1}`}{' '}
                      </Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height) +
                          [
                            ...(section.windows || []),
                            ...(section.doors || []),
                            ...(section.cupboards || []),
                          ].reduce(
                            (sum, win) =>
                              sum - calculateArea(win.width, win.height),
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
                          Repaint with Primer
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
                          Fresh Paint
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                      <TextInput
                        key={`w-${inputEpoch}-${index}`}
                        placeholder="L"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.width}
                        onChangeText={text => handleWidthChange(index, text)}
                      />
                      <Text style={styles.multiply}>×</Text>
                      <TextInput
                        key={`h-${inputEpoch}-${index}`}
                        placeholder="W"
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor="gray"
                        value={section.height}
                        onChangeText={text => handleHeightChange(index, text)}
                      />
                      <Text style={styles.equalSign}>=</Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height)}
                      </Text>
                    </View>
                    {section.windows?.map((win, winIndex) => (
                      <View key={winIndex} style={styles.windowSection}>
                        <Text style={styles.windowLabel}>
                          Window {winIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            key={`winw-${inputEpoch}-${index}-${winIndex}`}
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
                            key={`winh-${inputEpoch}-${index}-${winIndex}`}
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
                    {section.doors?.map((dr, doorIndex) => (
                      <View key={doorIndex} style={styles.windowSection}>
                        <Text style={styles.windowLabel}>
                          Opening {doorIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            key={`doorw-${inputEpoch}-${index}-${doorIndex}`}
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
                            key={`doorh-${inputEpoch}-${index}-${doorIndex}`}
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
                    {section.cupboards?.map((cup, cupIndex) => (
                      <View key={cupIndex} style={styles.windowSection}>
                        <Text style={styles.windowLabel}>
                          Cupboard {cupIndex + 1}
                        </Text>
                        <View style={styles.inputRow}>
                          <TextInput
                            placeholder="L"
                            key={`cupw-${inputEpoch}-${index}-${cupIndex}`}
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
                            key={`cuph-${inputEpoch}-${index}-${cupIndex}`}
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
                      <Text style={styles.sectionLabel}>
                        {section.label || `Wall ${index + 1}`}
                      </Text>

                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height) +
                          [
                            ...(section.windows || []),
                            ...(section.doors || []),
                            ...(section.cupboards || []),
                          ].reduce(
                            (sum, win) =>
                              sum - calculateArea(win.width, win.height),
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
                              styles.checkboxSelected, // <-- use section.mode
                          ]}
                        />
                        <Text
                          style={[
                            styles.checkboxLabel,
                            section.mode === MODE.REPAINT &&
                              styles.checkboxLabelSelected, // <-- use section.mode
                          ]}
                        >
                          Repaint with Primer
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
                              styles.checkboxSelected, // <-- use section.mode
                          ]}
                        />
                        <Text
                          style={[
                            styles.checkboxLabel,
                            section.mode === MODE.FRESH &&
                              styles.checkboxLabelSelected, // <-- use section.mode
                          ]}
                        >
                          Fresh Paint
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

                    {section.windows?.map((win, winIndex) => (
                      <View key={winIndex} style={styles.windowSection}>
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
                    {section.doors?.map((dr, doorIndex) => (
                      <View key={doorIndex} style={styles.windowSection}>
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
                    {section.cupboards?.map((cup, cupIndex) => (
                      <View key={cupIndex} style={styles.windowSection}>
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
          ) : activeTab === 'Exterior' ? (
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
                <View key={`${section.type}-${index}`} style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    {section.label ??
                      `${section.type === 'ceiling' ? 'Ceiling' : 'Wall'} ${
                        index + 1
                      }`}
                  </Text>
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
                        Repaint with Primer
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
                        Fresh Paint
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="L"
                      keyboardType="numeric"
                      placeholderTextColor="gray"
                      style={styles.input}
                      value={section.width}
                      onChangeText={text => handleWidthChange(index, text)}
                    />
                    <Text style={styles.multiply}>×</Text>
                    <TextInput
                      placeholder="W"
                      keyboardType="numeric"
                      placeholderTextColor="gray"
                      style={styles.input}
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
                onPress={addExteriorCeiling}
                style={styles.sectionButton}
              >
                <Text style={styles.sectionButtonText}>Add Ceiling</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={addExteriorWall}
                style={[styles.sectionButton, { marginBottom: 150 }]}
              >
                <Text style={styles.sectionButtonText}>Add Wall</Text>
                <Ionicons name="add-circle" size={25} color="#4CAF50" />
              </TouchableOpacity>
            </>
          ) : activeTab === 'Others' ? (
            <>
              {sections.map((section, index) => (
                <View key={`grill-${index}`} style={styles.section}>
                  <Text style={styles.sectionLabel}>{`${type} ${
                    index + 1
                  }`}</Text>
                  <View style={styles.underlineRed} />
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="L"
                      keyboardType="numeric"
                      placeholderTextColor="gray"
                      style={styles.input}
                      value={section.width}
                      onChangeText={text => handleWidthChange(index, text)}
                    />
                    <Text style={styles.multiply}>×</Text>
                    <TextInput
                      placeholder="W"
                      keyboardType="numeric"
                      placeholderTextColor="gray"
                      style={styles.input}
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
          ) : null}
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.doneButton} onPress={handleCheck}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
};

export default RoomMeasurementScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ED1F24',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ED1F24',
  },
  checkboxLabel: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  checkboxLabelSelected: {
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ED1F24',
    paddingHorizontal: 10,
    // height: 40,
    width: 80,
    borderRadius: 5,
    // marginHorizontal: 5,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  multiply: {
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 5,
  },
  equalSign: {
    fontSize: 16,
    color: '#000',
    marginHorizontal: 5,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  iconCheck: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 3,
  },
  infoText: {
    color: '#ED1F24',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Poppins-Medium',
  },
  windowSection: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  windowLabel: {
    fontSize: 13,
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
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
    // borderRadius: 8,
    alignItems: 'center',
    // marginVertical: 20,
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
    borderWidth: 0,
  },
  errorText: {
    color: '#ED1F24',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
});
