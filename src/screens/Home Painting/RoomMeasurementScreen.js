// RoomMeasurementScreen.js
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  BackHandler,
  ToastAndroid,
  Modal,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '../../Utilities/ThemeContext';
import { API_BASE_URL, API_ENDPOINTS } from '../../ApiService/apiConstants';
import { useLeadContext } from '../../Utilities/LeadContext';
import { useVendorContext } from '../../Utilities/VendorContext';
import { useEstimateContext } from '../../Utilities/EstimateContext';
import { useRoomNameContext } from '../../Utilities/RoomContext';
import PageLoader from '../../components/PageLoader';

const RoomMeasurementScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const MODE = { REPAINT: 'REPAINT', FRESH: 'FRESH' };
  const { deviceTheme } = useThemeColor();
  const scrollViewRef = useRef(null);
  const hydratedOnceRef = useRef(false);
  const { leadDataContext } = useLeadContext();
  const { vendorDataContext } = useVendorContext();
  const { nameOfTheRoom, setNameOfTheRoom } = useRoomNameContext();
  const debounceTimeout = useRef(null);
  const { type, activeTab } = route.params;
  const rawType = route?.params?.type;
  const isCustom = route.params.origin;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomDefaultMode, setRoomDefaultMode] = useState(MODE.REPAINT);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [etstimateData, setEstimateData] = useEstimateContext();
  const [localRoomName, setLocalRoomName] = useState(nameOfTheRoom);
  const [editName, setEditName] = useState(localRoomName);
  const inputRef = useRef(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const initialSectionsRef = useRef(null);
  const snapshot = x => JSON.parse(JSON.stringify(x || []));

  useEffect(() => {
    if (hydratedOnceRef.current && (isDirty || (sections?.length ?? 0) > 0))
      return;
    // ... your existing hydrate logic ...
    hydratedOnceRef.current = true;
  }, [etstimateData, nameOfTheRoom, type, rawType, activeTab, isRoomLike]);

  // console.log('nameOfTheRoom', nameOfTheRoom);
  // console.log('localRoomName', localRoomName);

  const lRefs = useRef([]); // L refs per row
  const wRefs = useRef([]); // W refs per row

  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => {
    try {
      setIsDirty(true);
    } catch (e) {
      console.log('markDirty err', e);
    }
  };

  // Header back → show custom popup when dirty
  const onHeaderBack = React.useCallback(() => {
    if (isDirty) setShowConfirmPopup(true);
    else if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('StartMeasurement', { defaultTab: activeTab });
  }, [isDirty, navigation, activeTab]);

  // Hardware back → same behavior; if popup open, close it
  useFocusEffect(
    React.useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        try {
          if (showConfirmPopup) {
            setShowConfirmPopup(false); // close the popup first
            return true;
          }
          if (isDirty) {
            setShowConfirmPopup(true); // open custom popup
            return true; // consume back
          }
          if (navigation.canGoBack()) navigation.goBack();
          else
            navigation.navigate('StartMeasurement', { defaultTab: activeTab });
          return true;
          // navigation.navigate('StartMeasurement', { defaultTab: activeTab });
          // return true;
        } catch (e) {
          console.log('hardwareBack err', e);
          return true;
        }
      });
      return () => sub.remove();
    }, [showConfirmPopup, isDirty, navigation, activeTab]),
  );

  const focusWidth = rowIndex => {
    try {
      wRefs.current[rowIndex]?.focus();
    } catch (e) {
      console.log('focusWidth err', e);
    }
  };

  const focusNextRowL = rowIndex => {
    try {
      const next = rowIndex + 1;
      if (next < sections.length) {
        lRefs.current[next]?.focus();
      } else {
        Keyboard.dismiss();
      }
    } catch (e) {
      console.log('focusNextRowL err', e);
    }
  };

  const setLRef = (el, i) => (lRefs.current[i] = el);
  const setWRef = (el, i) => (wRefs.current[i] = el);

  const existingRoomNames = Object.keys(etstimateData?.rooms || {}).filter(
    n => n !== localRoomName,
  );

  const doorLabelFor = section =>
    section?.type === 'ceiling' ? 'Opening' : 'Door';

  const normKey = s =>
    String(s || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    setLocalRoomName(nameOfTheRoom);
    setEditName(nameOfTheRoom);
  }, [nameOfTheRoom]);

  const canEditName = useMemo(() => {
    if (isCustom === 'PREDEFINED') return false; // predefined rooms never editable
    const cur = normKey(localRoomName);
    const initial = normKey(type); // the name the screen opened with
    // Editable if: still the initial name AND looks like a custom placeholder
    return cur === initial && cur.startsWith('custom');
  }, [isCustom, localRoomName, type]);

  const startEditing = () => {
    if (!canEditName) return;
    setEditName(localRoomName);
    setIsEditing(true);
  };

  const handleBack = () => {
    try {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('StartMeasurement', { defaultTab: activeTab });
    } catch (e) {
      console.log('Back navigation error:', e);
    }
  };

  const handleSave = async () => {
    if (!canEditName) {
      setIsEditing(false);
      return;
    }

    const newName = (editName || '').trim();
    if (!newName || normKey(newName) === normKey(localRoomName)) {
      setIsEditing(false);
      return;
    }

    const dup = existingRoomNames.some(n => normKey(n) === normKey(newName));
    if (dup) {
      Alert.alert('Duplicate room', 'A room with this name already exists.');
      return;
    }

    try {
      await updateRoomName(newName); // your re-key + context update
      setIsEditing(false); // after this, canEditName becomes false automatically
    } catch (e) {
      Alert.alert('Rename failed', 'Please try again.');
    }
  };

  const updateRoomName = async newName => {
    // update the global/context value
    setNameOfTheRoom(newName);

    // update local state so UI reflects immediately
    setLocalRoomName(newName);
    setEditName(newName);

    // (optional) if your estimate data is keyed by room name, rename that key too:
    setEstimateData(prev => {
      const rooms = prev?.rooms || {};
      if (!rooms[localRoomName]) return prev;
      const { [localRoomName]: room, ...rest } = rooms;
      return { ...prev, rooms: { ...rest, [newName]: room } };
    });

    ToastAndroid.showWithGravity(
      'Room Name Updated!',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
  };

  // const updateRoomName = async () => {
  //   setNameOfTheRoom(localRoomName);
  //   ToastAndroid.showWithGravity(
  //     'Room Name Updated!',
  //     ToastAndroid.LONG,
  //     ToastAndroid.CENTER,
  //   );
  // };

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.navigate('StartMeasurement', { defaultTab: activeTab });
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

  const setAllSectionModes = nextMode => {
    setSections(prev =>
      prev.map(s => ({ ...s, mode: nextMode, customMode: false })),
    );
  };

  const buildDefaultSections = (
    tab,
    inputDefaultMode = MODE.REPAINT,
    measurementType = type ?? 'Grills',
  ) => {
    // eslint-disable-next-line no-unused-vars
    // Ensure we capture the values safely
    const defaultMode = inputDefaultMode;
    const mt = measurementType;

    const makeCeiling = label => ({
      type: 'ceiling',
      width: '',
      height: '',
      windows: [],
      doors: [],
      cupboards: [],
      label,
      mode: defaultMode,
      // customMode: false,
      customMode: true,
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
      // customMode: false,
      customMode: true,
    });

    const makeOther = (label, t) => {
      const key = normalizeType(t ?? mt, 'grill');
      return {
        type: key,
        width: '',
        height: '',
        label,
        mode: defaultMode,
        // customMode: false,
        customMode: true,
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
            makeOther(`${mt} ${i + 1}`),
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
        return [makeCeiling('Ceiling 1'), makeWall('Wall 1')]; // fallback
    }
  };
  const hydrateFromRoom = (tab, room, measurementType) => {
    if (!room) {
      return buildDefaultSections(tab, roomDefaultMode, measurementType);
    }

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
  };

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
    console.log('Sections Updated: ', sections);
  }, [sections]);
  const [matchedKey, setMatchedKey] = useState(null);

  useEffect(() => {
    if (!etstimateData?.rooms) {
      // If no estimate data, fallback to default sections
      setSections(
        buildDefaultSections(activeTab, MODE.REPAINT, type || 'Grills'),
      );
      return;
    }

    const keyCandidates = [nameOfTheRoom, type, rawType].filter(Boolean);
    const picked = pickRoom(etstimateData, keyCandidates);

    let hydrated;
    if (picked?.room) {
      hydrated = hydrateFromRoom(activeTab, picked.room, type || 'Grills');
      setRoomDefaultMode(picked.room.mode || MODE.REPAINT);
      setMatchedKey(picked.matchedKey);
    } else {
      hydrated = buildDefaultSections(
        activeTab,
        MODE.REPAINT,
        type || 'Grills',
      );
      setMatchedKey(type);
    }

    // Final safety: ensure minimum one ceiling and one wall for room-like tabs
    if (isRoomLike) {
      const hasCeiling = hydrated.some(s => s.type === 'ceiling');
      const hasWall = hydrated.some(s => s.type === 'wall');

      const newSections = [...hydrated];

      if (!hasCeiling) {
        newSections.push({
          type: 'ceiling',
          width: '',
          height: '',
          windows: [],
          doors: [],
          cupboards: [],
          label: 'Ceiling 1',
          mode: roomDefaultMode,
          customMode: false,
        });
      }
      if (!hasWall) {
        const wallCount = hydrated.filter(s => s.type === 'wall').length + 1;
        newSections.push({
          type: 'wall',
          width: '',
          height: '',
          windows: [],
          doors: [],
          cupboards: [],
          label: `Wall ${wallCount}`,
          mode: roomDefaultMode,
          customMode: false,
        });
      }

      setSections(newSections);
      initialSectionsRef.current = snapshot(newSections); // baseline to restore
      setIsDirty(false);
    } else {
      setSections(
        hydrated.length
          ? hydrated
          : buildDefaultSections(activeTab, MODE.REPAINT, type || 'Grills'),
      );
    }
  }, [
    etstimateData,
    nameOfTheRoom,
    type,
    rawType,
    activeTab,
    // hydrateFromRoom,
    isRoomLike,
    // roomDefaultMode,
  ]);

  const calculateArea = (w, h) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    return isNaN(width) || isNaN(height) ? 0 : width * height;
  };
  console.log('calculateArea');

  const validateInput = value => {
    if (parseFloat(value) < 0) {
      return 'Negative values are not allowed.';
    }
    return '';
  };

  const onRoomDefaultRepaint = () => {
    setRoomDefaultMode(MODE.REPAINT);
    // setSections(prev =>
    //   prev.map(s => (s.customMode ? s : { ...s, mode: MODE.REPAINT })),
    // );
    setAllSectionModes(MODE.REPAINT);
    markDirty();
  };

  const onRoomDefaultFresh = () => {
    setRoomDefaultMode(MODE.FRESH);
    // setSections(prev =>
    //   prev.map(s => ({
    //     ...s,
    //     mode: s.customMode ? s.mode : MODE.FRESH,
    //   })),
    // );
    setAllSectionModes(MODE.FRESH);
    markDirty();
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
    markDirty();
  };

  const handleHeightChange = (index, value) => {
    const validationError = validateInput(value);
    setError(validationError);
    if (validationError) return;
    setSections(prev =>
      prev.map((s, i) => (i === index ? { ...s, height: value } : s)),
    );
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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

      const openingsArea = openings.reduce((sum, o) => {
        const w = toNumber(o.width);
        const h = toNumber(o.height);
        return sum + w * h;
      }, 0);

      const net = Math.max(gross - openingsArea, 0);

      return {
        width,
        height,
        area: gross,
        totalSqt: +net.toFixed(2), // ← CORRECT net area
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
      // const mapExt = s => ({
      //   width: toNumber(s.width),
      //   height: toNumber(s.height),
      //   area: area2(s.width, s.height),
      //   totalSqt: area2(s.width, s.height),
      //   windows: [],
      //   doors: [],
      //   cupboards: [],
      //   mode: s.mode || MODE.REPAINT,
      // });
      const ceilings = sections
        .filter(s => s.type === 'ceiling' && validRect(s.width, s.height))
        .map(mapCeilingWall); //added because of adding door,cupboard and window
      // .map(mapExt);  // removed because of adding door,cupboard and window
      const walls = sections
        .filter(s => s.type === 'wall' && validRect(s.width, s.height))
        .map(mapCeilingWall);
      // .map(mapExt);
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

  const handleCheck = async () => {
    if (loading) return;
    setLoading(true);
    setShowConfirmPopup(false);
    const sanitized = transformToBackendStructure(
      roomKeyToSave,
      sections,
      activeTab,
    );

    if (!sanitized.rooms || Object.keys(sanitized.rooms).length === 0) {
      setLoading(false);
      setShowAlertPopup(true);
      // Alert.alert(
      //   'No measurements',
      //   'Enter at least one Ceiling/Wall with valid length and width.',
      // );
      return;
    }
    try {
      const payload = {
        vendorId: vendorDataContext._id,
        leadId: leadDataContext._id,
        rooms: sanitized.rooms,
        previousRoomName: matchedKey,
        // previousRoomName: type,
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
      initialSectionsRef.current = snapshot(sections); // new baseline
      setIsDirty(false);
      navigation.navigate({
        name: 'StartMeasurement',
        params: {
          rename: {
            tab: activeTab,
            defaultTab: activeTab,
            from: type,
            to: roomKeyToSave,
          },
        },
        merge: true,
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformedData = transformToBackendStructure(
    roomKeyToSave,
    sections,
    activeTab,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={deviceTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {loading && <PageLoader />}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            // onPress={handleBack}
            onPress={onHeaderBack}
          >
            <Ionicons name="arrow-back" color="black" size={23} />
          </TouchableOpacity>

          {canEditName && isEditing ? (
            <>
              <TextInput
                ref={inputRef}
                value={editName}
                onChangeText={setEditName}
                style={[styles.roomNameInput, styles.roomNameInputEditing]}
                placeholder="Enter room name"
                placeholderTextColor="#9AA0A6"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <TouchableOpacity
                style={styles.tickRight}
                onPress={handleSave}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="checkmark-sharp" size={30} color="#006803ff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.roomNameTapArea}
              activeOpacity={canEditName ? 0.6 : 1}
              onPress={startEditing}
            >
              <Text style={styles.roomNameText} numberOfLines={1}>
                {localRoomName}
              </Text>
            </TouchableOpacity>
          )}
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
                        ref={r => {
                          try {
                            lRefs.current[index] = r;
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        placeholder="L"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.width}
                        onChangeText={text => handleWidthChange(index, text)}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          try {
                            focusWidth(index);
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Enter') {
                            try {
                              focusWidth(index);
                            } catch (e) {
                              console.log(e);
                            }
                          }
                        }}
                      />
                      <Text style={styles.multiply}>×</Text>
                      <TextInput
                        ref={r => {
                          try {
                            wRefs.current[index] = r;
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        placeholder="W"
                        placeholderTextColor="gray"
                        style={styles.input}
                        keyboardType="numeric"
                        value={section.height}
                        onChangeText={text => handleHeightChange(index, text)}
                        returnKeyType={
                          index < sections.length - 1 ? 'next' : 'done'
                        }
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          try {
                            focusNextRowL(index);
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Enter') {
                            try {
                              focusNextRowL(index);
                            } catch (e) {
                              console.log(e);
                            }
                          }
                        }}
                      />
                      <Text style={styles.equalSign}>=</Text>
                      <Text style={styles.areaText}>
                        {calculateArea(section.width, section.height)}
                      </Text>
                    </View>

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

                    {section.doors?.map((dr, doorIndex) => (
                      <View
                        key={`door-${index}-${doorIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          {doorLabelFor(section)} {doorIndex + 1}
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

                    {section.doors?.map((dr, doorIndex) => (
                      <View
                        key={`door-${index}-${doorIndex}`}
                        style={styles.windowSection}
                      >
                        <Text style={styles.windowLabel}>
                          {doorLabelFor(section)} {doorIndex + 1}
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
                        <Text style={styles.iconCheck}>
                          {' '}
                          {doorLabelFor(section)}
                        </Text>
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
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>{section.label}</Text>
                    <Text style={styles.areaText}>
                      {
                        // gross - sum(openings)
                        calculateArea(section.width, section.height) -
                          (section.windows || [])
                            .concat(section.doors || [])
                            .concat(section.cupboards || [])
                            .reduce(
                              (sum, o) =>
                                sum + calculateArea(o.width, o.height),
                              0,
                            )
                      }{' '}
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
                      onChangeText={text => {
                        try {
                          handleWidthChange(index, text);
                        } catch (e) {
                          console.log('width change error', e);
                        }
                      }}
                    />
                    <Text style={styles.multiply}>×</Text>
                    <TextInput
                      placeholder="W"
                      placeholderTextColor="gray"
                      style={styles.input}
                      keyboardType="numeric"
                      value={section.height}
                      onChangeText={text => {
                        try {
                          handleHeightChange(index, text);
                        } catch (e) {
                          console.log('height change error', e);
                        }
                      }}
                    />
                    <Text style={styles.equalSign}>=</Text>
                    <Text style={styles.areaText}>
                      {calculateArea(section.width, section.height)}
                    </Text>
                  </View>

                  {/* Windows */}
                  {(section.windows || []).map((win, winIndex) => (
                    <View
                      key={`ext-window-${index}-${winIndex}`}
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
                          onChangeText={text => {
                            try {
                              handleWindowWidthChange(index, winIndex, text);
                            } catch (e) {
                              console.log('win w err', e);
                            }
                          }}
                        />
                        <Text style={styles.multiply}>×</Text>
                        <TextInput
                          placeholder="W"
                          placeholderTextColor="gray"
                          style={styles.input}
                          keyboardType="numeric"
                          value={win.height}
                          onChangeText={text => {
                            try {
                              handleWindowHeightChange(index, winIndex, text);
                            } catch (e) {
                              console.log('win h err', e);
                            }
                          }}
                        />
                        <Text style={styles.equalSign}>=</Text>
                        <Text style={styles.areaText}>
                          {calculateArea(win.width, win.height)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Doors (a.k.a. openings) */}
                  {(section.doors || []).map((dr, doorIndex) => (
                    <View
                      key={`ext-door-${index}-${doorIndex}`}
                      style={styles.windowSection}
                    >
                      <Text style={styles.windowLabel}>
                        {doorLabelFor(section)} {doorIndex + 1}
                      </Text>
                      <View style={styles.inputRow}>
                        <TextInput
                          placeholder="L"
                          placeholderTextColor="gray"
                          style={styles.input}
                          keyboardType="numeric"
                          value={dr.width}
                          onChangeText={text => {
                            try {
                              handleDoorWidthChange(index, doorIndex, text);
                            } catch (e) {
                              console.log('door w err', e);
                            }
                          }}
                        />
                        <Text style={styles.multiply}>×</Text>
                        <TextInput
                          placeholder="W"
                          placeholderTextColor="gray"
                          style={styles.input}
                          keyboardType="numeric"
                          value={dr.height}
                          onChangeText={text => {
                            try {
                              handleDoorHeightChange(index, doorIndex, text);
                            } catch (e) {
                              console.log('door h err', e);
                            }
                          }}
                        />
                        <Text style={styles.equalSign}>=</Text>
                        <Text style={styles.areaText}>
                          {calculateArea(dr.width, dr.height)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Cupboards */}
                  {(section.cupboards || []).map((cup, cupIndex) => (
                    <View
                      key={`ext-cup-${index}-${cupIndex}`}
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
                          onChangeText={text => {
                            try {
                              handleCupBoardWidthChange(index, cupIndex, text);
                            } catch (e) {
                              console.log('cup w err', e);
                            }
                          }}
                        />
                        <Text style={styles.multiply}>×</Text>
                        <TextInput
                          placeholder="W"
                          placeholderTextColor="gray"
                          style={styles.input}
                          keyboardType="numeric"
                          value={cup.height}
                          onChangeText={text => {
                            try {
                              handleCupBoardHeightChange(index, cupIndex, text);
                            } catch (e) {
                              console.log('cup h err', e);
                            }
                          }}
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
                      onPress={() => {
                        try {
                          addWindow(index);
                        } catch (e) {
                          console.log('add window err', e);
                        }
                      }}
                    >
                      <Ionicons name="add-circle" size={15} color="#4CAF50" />
                      <Text style={styles.iconCheck}> Window</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        try {
                          addDoor(index);
                        } catch (e) {
                          console.log('add door err', e);
                        }
                      }}
                    >
                      <Ionicons name="add-circle" size={15} color="#4CAF50" />
                      <Text style={styles.iconCheck}>
                        {' '}
                        {doorLabelFor(section)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        try {
                          addCupBoard(index);
                        } catch (e) {
                          console.log('add cup err', e);
                        }
                      }}
                    >
                      <Ionicons name="add-circle" size={15} color="#4CAF50" />
                      <Text style={styles.iconCheck}> Cupboard</Text>
                    </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.doneButton}
        disabled={loading}
        onPress={loading ? null : handleCheck}
      >
        <Text style={styles.doneButtonText}> Done </Text>
      </TouchableOpacity>
      {/* {error ? <Text style={styles.errorText}>{error}</Text> : null} */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAlertPopup}
        onRequestClose={() => setShowAlertPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
              No Measurements
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Enter at least one ceiling/wall with valid length and width
            </Text>
            <View style={styles.flexRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAlertPopup(false)}
              >
                <Text style={styles.cancelButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* confirm popup - discard */}
      <Modal
        animationType="fade"
        transparent
        visible={showConfirmPopup}
        onRequestClose={() => setShowConfirmPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
              Discard the changes?
            </Text>

            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                marginTop: 10,
                marginBottom: 20,
                color: '#444',
              }}
            >
              Are you sure, you want to exit without saving the changes?
            </Text>

            <View style={[styles.flexRow, { justifyContent: 'flex-end' }]}>
              {/* YES (ghost / less prominent) */}
              <TouchableOpacity
                style={[styles.btnBase, styles.btnGhost]}
                onPress={() => {
                  try {
                    // restore snapshot and exit
                    if (initialSectionsRef.current) {
                      setSections(snapshot(initialSectionsRef.current));
                    }
                    setIsDirty(false);
                    setShowConfirmPopup(false);

                    if (navigation.canGoBack()) navigation.goBack();
                    else
                      navigation.navigate('StartMeasurement', {
                        defaultTab: activeTab,
                      });
                  } catch (e) {
                    console.log('discard yes err', e);
                  }
                }}
              >
                <Text style={[styles.btnTextGhost]}>Yes</Text>
              </TouchableOpacity>

              {/* NO (solid red / prominent, on the right) */}
              <TouchableOpacity
                style={[styles.btnBase, styles.btnSolidRed, { marginLeft: 10 }]}
                onPress={() => setShowConfirmPopup(false)}
              >
                <Text style={styles.btnTextSolid}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative', // <-- anchor for absolute ✓
    minHeight: 48,
  },
  roomNameInput: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingRight: 44, // <-- leave space for ✓
    color: '#232323',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
  },
  roomNameInputEditing: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9e9',
  },
  roomNameTapArea: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 6,
    paddingRight: 44, // <-- consistent width so text doesn't collide with ✓ area
  },
  roomNameText: {
    color: '#232323',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    marginTop: 5,
  },
  tickRight: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center', // vertically centers ✓
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#ED1F24',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: 'red',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  btnBase: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderColor: '#BDBDBD',
  },
  btnSolidRed: {
    backgroundColor: '#ED1F24',
  },
  btnTextGhost: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#111',
  },
  btnTextSolid: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
});
