import { Flex, Text, Touchable, Checkbox } from "@artsy/palette-mobile"
import { NavigationProp } from "@react-navigation/native"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"

interface TermsOfServiceCheckboxProps {
  checked: boolean
  setChecked: (checked: boolean) => void
  error: boolean
  navigation: NavigationProp<any>
}

export const TermsOfServiceCheckbox: React.FC<TermsOfServiceCheckboxProps> = ({
  setChecked,
  checked,
  error,
  navigation,
}) => {
  const showNewDisclaimer = useFeatureFlag("AREnableNewTermsAndConditions")

  return (
    <Touchable haptic onPress={() => setChecked(!checked)}>
      <Flex flexDirection="row" alignItems="flex-start">
        <Checkbox
          error={error}
          checked={checked}
          onPress={() => setChecked(!checked)}
          mt={0.5}
          checkboxAccessibilityProps={{
            accessible: true,
            accessibilityRole: "checkbox",
            accessibilityLabel: "Accept terms and privacy policy",
            accessibilityHint: "Check this element to accept Artsy's terms and privacy policy",
            accessibilityState: {
              checked,
            },
          }}
        >
          {showNewDisclaimer ? (
            <Text variant="xs" testID="disclaimer">
              I accept Artsy's{" "}
              <Text
                onPress={() => navigation.navigate("OnboardingWebView", { url: "/terms" })}
                variant="xs"
                style={{ textDecorationLine: "underline" }}
              >
                General Terms and Conditions of Sale
              </Text>{" "}
              and{" "}
              <Text
                onPress={() => navigation.navigate("OnboardingWebView", { url: "/privacy" })}
                variant="xs"
                style={{ textDecorationLine: "underline" }}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          ) : (
            <Text variant="xs" testID="disclaimer">
              By checking this box, you consent to our{" "}
              <Text
                onPress={() => navigation.navigate("OnboardingWebView", { url: "/terms" })}
                variant="xs"
                style={{ textDecorationLine: "underline" }}
              >
                Terms of Use
              </Text>
              ,{" "}
              <Text
                onPress={() => navigation.navigate("OnboardingWebView", { url: "/privacy" })}
                variant="xs"
                style={{ textDecorationLine: "underline" }}
              >
                Privacy Policy
              </Text>
              , and{" "}
              <Text
                onPress={() =>
                  navigation.navigate("OnboardingWebView", { url: "/conditions-of-sale" })
                }
                variant="xs"
                style={{ textDecorationLine: "underline" }}
              >
                Conditions of Sale
              </Text>
              .
            </Text>
          )}
        </Checkbox>
      </Flex>
    </Touchable>
  )
}
