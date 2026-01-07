import { Image } from 'react-native';
import React, { useEffect, useState } from 'react';

const DynamicImage = ({ uri }) => {
  //   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  //   useEffect(() => {
  //     Image.getSize(
  //       uri,
  //       (width, height) => {
  //         setDimensions({ width, height });
  //       },
  //       error => {
  //         console.error('Error loading image:', error);
  //       },
  //     );
  //   }, [uri]);

  //   if (!dimensions.width || !dimensions.height) return null;

  return (
    <Image
      source={{ uri }}
      style={{
        // width: dimensions.width,
        // height: dimensions.height,
        width: '100%',
        height: 350,
        marginVertical: 5,
        alignSelf: 'center',
      }}
      resizeMode="contain"
    />
  );
};

export default DynamicImage;
