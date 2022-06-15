import SearchIcon from "app/Icons/SearchIcon"
import {
  emitInputClearEvent,
  Flex,
  Input,
  InputProps,
  SpacingUnitV2,
  SpacingUnitV3,
  Text,
  useSpace,
} from "palette"
import React, { useImperativeHandle, useRef, useState } from "react"
import { TextInput, TouchableOpacity, useWindowDimensions } from "react-native"
import Animated, {
  FadeInRight,
  FadeOutRight,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"

const MX = 2
const CANCEL_BUTTON_DURATION = 180

export interface SearchInputProps extends InputProps {
  mx?: SpacingUnitV2 | SpacingUnitV3
  enableCancelButton?: boolean
  onCancelPress?: () => void
}

export const SearchInput = React.forwardRef<TextInput, SearchInputProps>(
  (
    { enableCancelButton, onChangeText, onClear, onCancelPress, mx = MX, ...props },
    ref: React.Ref<Partial<TextInput>>
  ) => {
    const [cancelWidth, setCancelWidth] = useState(0)
    const space = useSpace()
    const [cancelButtonShown, setCancelButtonShown] = useState(false)
    const width = useWindowDimensions().width - space(mx) * 2

    const shrinkAnim = useAnimatedStyle(
      () => ({
        width: withTiming(width - (cancelButtonShown ? cancelWidth : 0), {
          duration: CANCEL_BUTTON_DURATION,
        }),
      }),
      [cancelButtonShown, cancelWidth]
    )

    const inputRef = useRef<TextInput>(null)
    useImperativeHandle(ref, () => inputRef?.current ?? {})

    return (
      <Flex flexDirection="row">
        <Animated.View style={[shrinkAnim, { backgroundColor: "green", paddingTop: 2 }]}>
          <Input
            ref={inputRef}
            icon={<SearchIcon width={18} height={18} />}
            autoCorrect={false}
            enableClearButton
            returnKeyType="search"
            addClearListener
            onClear={() => {
              onClear?.()
              inputRef?.current?.focus()
            }}
            onChangeText={onChangeText}
            {...props}
            onFocus={(e) => {
              setCancelButtonShown(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setCancelButtonShown(false)
              props.onBlur?.(e)
            }}
          />
        </Animated.View>
        <Flex alignItems="center" justifyContent="center">
          {!!enableCancelButton && !!cancelButtonShown && (
            <Animated.View
              entering={FadeInRight.duration(CANCEL_BUTTON_DURATION)}
              exiting={FadeOutRight.duration(CANCEL_BUTTON_DURATION)}
            >
              <TouchableOpacity
                onPress={() => {
                  emitInputClearEvent()
                  inputRef?.current?.blur()
                  onCancelPress?.()
                }}
                hitSlop={{ bottom: 40, right: 40, left: 0, top: 40 }}
                onLayout={(e) => {
                  setCancelWidth(e.nativeEvent.layout.width)
                }}
              >
                <Text pl={1} color="black60" variant="xs">
                  Cancel
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Flex>
      </Flex>
    )
  }
)
