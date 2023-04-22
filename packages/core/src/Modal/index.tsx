import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Animated, StyleSheet, LayoutChangeEvent, Dimensions, ViewStyle } from 'react-native';
import MaskLayer, { MaskLayerProps } from '../MaskLayer';
import { Theme } from '../theme';
import { useTheme } from '@shopify/restyle';

const MainWidth = Dimensions.get('window').width;
const MainHeight = Dimensions.get('window').height;

export interface ModalProps extends MaskLayerProps {
  placement?: 'top' | 'right' | 'bottom' | 'left';
  onClosed?: () => void;
  containerStyle?: ViewStyle;
}

const Modal = (props: ModalProps = {}) => {
  const { onClosed, visible, children, placement = 'bottom', containerStyle, ...otherProps } = props;
  const theme = useTheme<Theme>();
  const AnimatedOpacity = useRef(new Animated.Value(0)).current;
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [translateValue] = useState(new Animated.Value(0));
  const isVertical = /^(top|bottom)$/.test(placement);
  const isHorizontal = /^(left|right)$/.test(placement);

  useEffect(() => {
    function getTransformSize() {
      if (placement === 'top') {
        return -layoutHeight;
      }
      if (placement === 'bottom') {
        return layoutHeight;
      }
      if (placement === 'left') {
        return -layoutWidth;
      }
      if (placement === 'right') {
        return layoutWidth;
      }
      return 0;
    }
    const result = getTransformSize();
    if (!result) return;
    if (visible) {
      translateValue.setValue(result);
      Animated.parallel([
        Animated.timing(AnimatedOpacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.spring(translateValue, {
          toValue: 0,
          overshootClamping: true,
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (!visible) {
      Animated.parallel([
        Animated.spring(translateValue, {
          toValue: result,
          overshootClamping: true,
          useNativeDriver: true,
        }),
        Animated.timing(AnimatedOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, layoutHeight, layoutWidth, placement, translateValue, AnimatedOpacity]);

  const translateStyle = {} as {
    translateY: Animated.Value;
    translateX: Animated.Value;
  };
  if (isVertical) {
    translateStyle.translateY = translateValue;
  }
  if (isHorizontal) {
    translateStyle.translateX = translateValue;
  }

  const child = useMemo(
    () => (
      <Animated.View
        style={[styles.content, placement && styles[placement], { opacity: AnimatedOpacity }, containerStyle]}
      >
        <Animated.View
          onLayout={(event: LayoutChangeEvent) => {
            const { height, width } = event.nativeEvent.layout;
            if (!layoutHeight && isVertical) {
              setLayoutHeight(height);
            }
            if (!layoutWidth && isHorizontal) {
              setLayoutWidth(width);
            }
          }}
          style={[
            styles.content,
            placement && styles[placement],
            {
              transform: [translateStyle],
              backgroundColor: theme.colors.mask || '#fff',
              position: 'relative',
              zIndex: 10000,
            },
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    ),
    [
      children,
      AnimatedOpacity,
      containerStyle,
      isHorizontal,
      isVertical,
      layoutHeight,
      layoutWidth,
      placement,
      theme.colors.mask,
      translateStyle,
    ],
  );

  return (
    <MaskLayer {...otherProps} visible={visible} onDismiss={onClosed}>
      {child}
    </MaskLayer>
  );
};

export default Modal;

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    zIndex: 9999,
  },
  top: {
    top: 0,
    width: MainWidth,
    left: 0,
    right: 0,
  },
  bottom: {
    bottom: 0,
    left: 0,
    width: MainWidth,
    right: 0,
  },
  left: {
    bottom: 0,
    top: 0,
    height: MainHeight,
    left: 0,
  },
  right: {
    bottom: 0,
    top: 0,
    height: MainHeight,
    right: 0,
  },
});
