import React from 'react';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

export default function PoliceBadge({ width = 200, height = 200 }) {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 200 200">
        {/* Outer shield */}
        <Path
          d="M100 10 L160 40 L160 120 C160 150 130 180 100 190 C70 180 40 150 40 120 L40 40 Z"
          fill="#1A237E"
          stroke="#102"
          strokeWidth="2"
        />
        
        {/* Inner shield */}
        <Path
          d="M100 25 L145 50 L145 115 C145 140 120 165 100 175 C80 165 55 140 55 115 L55 50 Z"
          fill="#3949AB"
          stroke="#102"
          strokeWidth="1"
        />
        
        {/* Center circle */}
        <Circle cx="100" cy="100" r="40" fill="#C5CAE9" />
        
        {/* Badge text */}
        <SvgText
          x="100"
          y="85"
          fontSize="16"
          fontWeight="bold"
          fill="#0D47A1"
          textAnchor="middle"
        >
          DRIVEME
        </SvgText>
        
        <SvgText
          x="100"
          y="105"
          fontSize="18"
          fontWeight="bold"
          fill="#0D47A1"
          textAnchor="middle"
        >
          POLICE
        </SvgText>
        
        <SvgText
          x="100"
          y="125"
          fontSize="10"
          fill="#0D47A1"
          textAnchor="middle"
        >
          OFFICIAL
        </SvgText>
      </Svg>
    </View>
  );
} 