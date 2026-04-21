import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLeadContext } from './LeadContext';

const useBackHandler = () => {
  const navigation = useNavigation();
  const { leadDataContext, setLeadDataContext } = useLeadContext();

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        // if (leadDataContext) {
        //   setLeadDataContext(null);
        // }
        navigation.navigate('BottomTab', {
          screen: 'Ongoing',
        });
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
};

export default useBackHandler;
