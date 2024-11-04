import { ContextModule, ScreenOwnerType } from "@artsy/cohesion"
import { Chip, Flex, Skeleton, SkeletonBox, Spacer, useSpace } from "@artsy/palette-mobile"
import { HomeViewSectionCardsChipsQuery } from "__generated__/HomeViewSectionCardsChipsQuery.graphql"
import { HomeViewSectionCardsChips_section$key } from "__generated__/HomeViewSectionCardsChips_section.graphql"
import { SectionTitle } from "app/Components/SectionTitle"
import { getSnapToOffsets } from "app/Scenes/CollectionsByCategory/CollectionsChips"
import { HomeViewSectionSentinel } from "app/Scenes/HomeView/Components/HomeViewSectionSentinel"
import { SectionSharedProps } from "app/Scenes/HomeView/Sections/Section"
import { useHomeViewTracking } from "app/Scenes/HomeView/useHomeViewTracking"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { NoFallback, withSuspense } from "app/utils/hooks/withSuspense"
import { FlatList, ScrollView } from "react-native"
import { isTablet } from "react-native-device-info"
import { graphql, useFragment, useLazyLoadQuery } from "react-relay"

interface HomeViewSectionCardsChipsProps {
  section: HomeViewSectionCardsChips_section$key
  index: number
}

const CHIP_WIDTH = 230

export const HomeViewSectionCardsChips: React.FC<HomeViewSectionCardsChipsProps> = ({
  section: sectionProp,
  index,
}) => {
  const space = useSpace()
  const tracking = useHomeViewTracking()
  const section = useFragment(fragment, sectionProp)
  const cards = extractNodes(section.cardsConnection)

  if (cards.length === 0) return null

  const numColumns = !isTablet() ? Math.ceil(cards.length / 3) : Math.ceil(cards.length / 2)
  const snapToOffsets = getSnapToOffsets(numColumns, space(1), space(1), CHIP_WIDTH)

  const handleOnChipPress = (card: (typeof cards)[number], index: number) => {
    if (card.href) {
      tracking.tappedCardGroup(
        card.entityID,
        card.entityType as ScreenOwnerType,
        card.href,
        section.contextModule as ContextModule,
        index
      )
      navigate(card.href)
    }
  }

  return (
    <Flex pl={2} py={2}>
      <Flex>
        <SectionTitle title={section.component?.title} />
      </Flex>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToEnd={false}
        snapToOffsets={snapToOffsets}
        decelerationRate="fast"
      >
        <FlatList
          scrollEnabled={true}
          columnWrapperStyle={{ gap: space(1), paddingRight: space(2) }}
          ItemSeparatorComponent={() => <Spacer y={1} />}
          contentContainerStyle={{ gap: 40 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          numColumns={numColumns}
          data={cards}
          keyExtractor={(item, index) => `item_${index}_${item.entityID}`}
          renderItem={({ item, index }) => (
            <Flex minWidth={CHIP_WIDTH}>
              <Chip
                key={item.href}
                title={item.title}
                onPress={() => handleOnChipPress(item, index)}
              />
            </Flex>
          )}
        />
      </ScrollView>

      <HomeViewSectionSentinel
        contextModule={section.contextModule as ContextModule}
        index={index}
      />
    </Flex>
  )
}

const fragment = graphql`
  fragment HomeViewSectionCardsChips_section on HomeViewSectionCards {
    __typename
    internalID
    contextModule
    ownerType
    component {
      title
    }
    cardsConnection {
      edges {
        node {
          entityID @required(action: NONE)
          entityType @required(action: NONE)
          title
          href
        }
      }
    }
  }
`

const HomeViewSectionCardsChipsPlaceholder: React.FC = () => {
  const listSize = 9

  const numColumns = isTablet() ? Math.ceil(listSize / 2) : Math.ceil(listSize / 3)
  return (
    <Skeleton>
      <Flex pl={2}>
        <Flex>
          <SectionTitle title="Discover Something New" />
        </Flex>
        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 10 }}
        >
          <FlatList
            scrollEnabled={true}
            contentContainerStyle={{ alignSelf: "flex-start" }}
            ItemSeparatorComponent={() => <Spacer y={1} />}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            numColumns={numColumns}
            data={Array.from({ length: listSize })}
            renderItem={() => (
              <Flex width={250} marginRight="10px">
                <SkeletonBox height={60} borderRadius="5px" />
              </Flex>
            )}
          />
        </ScrollView>
      </Flex>
    </Skeleton>
  )
}

const query = graphql`
  query HomeViewSectionCardsChipsQuery($id: String!, $isEnabled: Boolean!) {
    homeView {
      section(id: $id) @include(if: $isEnabled) {
        ...HomeViewSectionCardsChips_section
      }
    }
  }
`

export const HomeViewSectionCardsChipsQueryRenderer: React.FC<SectionSharedProps> = withSuspense({
  Component: ({ sectionID, index, ...flexProps }) => {
    const isEnabled = useFeatureFlag("AREnableMarketingCollectionsCategories")
    const data = useLazyLoadQuery<HomeViewSectionCardsChipsQuery>(query, {
      id: sectionID,
      isEnabled,
    })

    if (!data?.homeView.section || !isEnabled) {
      return null
    }

    return (
      <HomeViewSectionCardsChips section={data.homeView.section} index={index} {...flexProps} />
    )
  },
  LoadingFallback: HomeViewSectionCardsChipsPlaceholder,
  ErrorFallback: NoFallback,
})