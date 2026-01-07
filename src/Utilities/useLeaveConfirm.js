import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function useLeaveConfirm(enabled, { onDiscard } = {}) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!enabled) return;

    const sub = navigation.addListener('beforeRemove', e => {
      if (!enabled) return;
      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'Are you sure you want to exit without saving the changes?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
              try {
                await onDiscard?.();
              } catch {}
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });

    // Make hardware back go through the same confirm
    const bh = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      sub && sub();
      bh.remove();
    };
  }, [enabled, navigation, onDiscard]);
}
