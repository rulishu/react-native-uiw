import React, { memo } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { WhellPickerItemProps } from './type';
import { Theme } from '../.././../theme';
import { useTheme } from '@shopify/restyle';

const opacityFunction = (val: number) => 1 / (1 + Math.abs(val));
const scaleFunction = (val: number) => 1 - 0.1 * Math.abs(val);
const rotationFunction = (val: number) => 20 * val;

function WheelPickerItem({ textStyle, style, visibleRest, height, option, index, currentIndex }: WhellPickerItemProps) {
  const relativeScrollIndex = Animated.subtract(index, currentIndex);
  const theme = useTheme<Theme>();
  const textColor = theme.colors.primary_text || '#ccc';
  const inputRange = [0];
  for (let i = 1; i <= visibleRest + 1; i++) {
    inputRange.unshift(-i);
    inputRange.push(i);
  }

  const opacityOutputRange = [1];
  for (let x = 1; x <= visibleRest + 1; x++) {
    const y = opacityFunction(x);
    opacityOutputRange.unshift(y);
    opacityOutputRange.push(y);
  }

  const scaleOutputRange = [1.0];
  for (let x = 1; x <= visibleRest + 1; x++) {
    const y = scaleFunction(x);
    scaleOutputRange.unshift(y);
    scaleOutputRange.push(y);
  }

  const rotateXOutputRange = ['0deg'];
  for (let x = 1; x <= visibleRest + 1; x++) {
    const y = rotationFunction(x);
    rotateXOutputRange.unshift(`${y}deg`);
    rotateXOutputRange.push(`${y}deg`);
  }

  const opacity = relativeScrollIndex.interpolate({ inputRange, outputRange: opacityOutputRange });
  const scale = relativeScrollIndex.interpolate({ inputRange, outputRange: scaleOutputRange });
  const rotateX = relativeScrollIndex.interpolate({ inputRange, outputRange: rotateXOutputRange });

  return (
    <Animated.View style={[styles.option, style, { height, opacity, transform: [{ rotateX }, { scale }] }]}>
      <Text style={[{ color: textColor }, textStyle]}>{option?.label}</Text>
    </Animated.View>
  );
}
export default memo(WheelPickerItem, (prevProps, nextProps) => {
  return prevProps.option === nextProps.option;
});
const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});
