package com.example.tastemem.data

import junit.framework.TestCase.assertEquals
import org.junit.Test

class RecommendationRequestBuilderTest {
    @Test
    fun goWild_usesAllLinkedEntitiesAndLeavesTargetOpenForQloo() {
        val shelves = listOf(
            Shelf(
                id = "anime",
                title = "Anime",
                category = CulturalCategory.ANIME,
                items = listOf(
                    CulturalItem("a1", "anime", "Spirited Away", CulturalCategory.ANIME, qlooEntityId = "qloo-a"),
                    CulturalItem("a2", "anime", "Cowboy Bebop", CulturalCategory.ANIME),
                ),
            ),
            Shelf(
                id = "books",
                title = "Books",
                category = CulturalCategory.BOOKS,
                items = listOf(
                    CulturalItem("b1", "books", "Piranesi", CulturalCategory.BOOKS, qlooEntityId = "qloo-b"),
                ),
            ),
        )

        val request = RecommendationRequestBuilder.build(
            mode = RecommendationMode.GO_WILD,
            shelves = shelves,
            selectedShelfId = "anime",
        )

        assertEquals(listOf("qloo-a", "qloo-b"), request.signalEntityIds)
        assertEquals(null, request.targetCategory)
        assertEquals(6, request.take)
    }

    @Test
    fun tripGuide_includesLocationAndUsesSelectedShelfSignals() {
        val shelf = Shelf(
            id = "music",
            title = "Music",
            category = CulturalCategory.MUSIC,
            items = listOf(
                CulturalItem("m1", "music", "Nujabes", CulturalCategory.MUSIC, qlooEntityId = "qloo-m"),
            ),
        )

        val request = RecommendationRequestBuilder.build(
            mode = RecommendationMode.TRIP,
            shelves = listOf(shelf),
            selectedShelfId = shelf.id,
            location = "Tokyo",
        )

        assertEquals(listOf("qloo-m"), request.signalEntityIds)
        assertEquals("Tokyo", request.location)
        assertEquals(CulturalCategory.PLACES, request.targetCategory)
    }
}
