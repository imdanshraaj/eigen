import {
  ArrowRightIcon,
  Flex,
  Separator,
  Skeleton,
  SkeletonText,
  Spacer,
  useScreenDimensions,
} from "@artsy/palette-mobile"
import { ArtworkRail_artworks$data } from "__generated__/ArtworkRail_artworks.graphql"
import { CollectionRailCollectionsByCategoryQuery } from "__generated__/CollectionRailCollectionsByCategoryQuery.graphql"
import { CollectionRail_marketingCollection$key } from "__generated__/CollectionRail_marketingCollection.graphql"
import { ArtworkRail, ArtworkRailPlaceholder } from "app/Components/ArtworkRail/ArtworkRail"
import { SectionTitle } from "app/Components/SectionTitle"
import { useCollectionByCategoryTracking } from "app/Scenes/CollectionsByCategory/hooks/useCollectionByCategoryTracking"
import { navigate } from "app/system/navigation/navigate"
import { ElementInView } from "app/utils/ElementInView"
import { extractNodes } from "app/utils/extractNodes"
import { withSuspense, NoFallback } from "app/utils/hooks/withSuspense"
import { FC, useState } from "react"
import { graphql, useFragment, useLazyLoadQuery } from "react-relay"

interface CollectionRailProps {
  collection: CollectionRail_marketingCollection$key
  lastElement?: boolean
}

export const CollectionRail: FC<CollectionRailProps> = ({
  collection: _collection,
  lastElement,
}) => {
  const collection = useFragment(fragment, _collection)
  const { trackArtworkRailItemTap, trackArtworkRailViewAllTap } = useCollectionByCategoryTracking()

  if (!collection || collection.artworksConnection?.counts.total === 0) {
    return null
  }

  const artworks = extractNodes(collection.artworksConnection)

  const handleArtworkPress = (artwork: ArtworkRail_artworks$data[0], index: number) => {
    trackArtworkRailItemTap(artwork.internalID, index)
    navigate(artwork.href ?? "")
  }

  const handleTitlePress = () => {
    trackArtworkRailViewAllTap(collection.slug)
    navigate(`/collection/${collection.slug}`)
  }

  if (!artworks.length) {
    return null
  }

  return (
    <>
      <Flex px={2}>
        <Flex justifyContent="center">
          <SectionTitle
            title={collection.title}
            titleVariant="md"
            onPress={handleTitlePress}
            RightButtonContent={() => (
              <Flex flexDirection="row" flex={1}>
                <Flex my="auto">
                  <ArrowRightIcon fill="black60" ml={0.5} />
                </Flex>
              </Flex>
            )}
          />
        </Flex>
        <ArtworkRail
          onPress={handleArtworkPress}
          artworks={artworks}
          ListHeaderComponent={null}
          showSaveIcon
          showPartnerName
        />
      </Flex>

      {!lastElement && <Separator borderColor="black10" my={4} />}
    </>
  )
}

const fragment = graphql`
  fragment CollectionRail_marketingCollection on MarketingCollection {
    title @required(action: NONE)
    slug @required(action: NONE)

    artworksConnection(first: 10, sort: "-decayed_merch") {
      counts @required(action: NONE) {
        total
      }
      edges {
        node {
          ...ArtworkRail_artworks

          internalID
          slug
          href
        }
      }
    }
  }
`

export const CollectionRailPlaceholder: FC<Partial<CollectionRailProps>> = ({ lastElement }) => {
  return (
    <Skeleton>
      <Flex px={2}>
        <Flex justifyContent="space-between" flexDirection="row">
          <SkeletonText variant="md">Category title</SkeletonText>
          <ArrowRightIcon />
        </Flex>

        <Spacer y={1} />

        <Flex flexDirection="row">
          <ArtworkRailPlaceholder />
          <Separator borderColor="black10" my={2} />
        </Flex>
      </Flex>

      {!lastElement && <Separator borderColor="black10" my={4} />}
    </Skeleton>
  )
}

const query = graphql`
  query CollectionRailCollectionsByCategoryQuery($slug: String!, $isVisible: Boolean!) {
    marketingCollection(slug: $slug) @include(if: $isVisible) {
      ...CollectionRail_marketingCollection

      title
      markdownDescription
    }
  }
`

interface CollectionRailWithSuspenseProps {
  slug: string
}

export const CollectionRailWithSuspense = withSuspense<
  CollectionRailWithSuspenseProps & Partial<CollectionRailProps>
>({
  Component: ({ slug, lastElement }) => {
    const { height } = useScreenDimensions()
    const [isVisible, setIsVisible] = useState(false)
    const data = useLazyLoadQuery<CollectionRailCollectionsByCategoryQuery>(query, {
      slug,
      isVisible,
    })

    const handleOnVisible = () => {
      if (!isVisible) {
        setIsVisible(true)
      }
    }

    if (!data?.marketingCollection || !isVisible) {
      // We don't need to overfetch all rails at once, fetch as they become closer to be visible
      return (
        <ElementInView onVisible={handleOnVisible} visibilityMargin={-height}>
          <CollectionRailPlaceholder lastElement={lastElement} />
        </ElementInView>
      )
    }

    return <CollectionRail collection={data.marketingCollection} lastElement={lastElement} />
  },
  ErrorFallback: NoFallback,
  LoadingFallback: CollectionRailPlaceholder,
})
