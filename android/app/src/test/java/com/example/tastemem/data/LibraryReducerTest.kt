package com.example.tastemem.data

import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertFalse
import junit.framework.TestCase.assertTrue
import org.junit.Test

class LibraryReducerTest {
    @Test
    fun addItem_createsShelfCoverAndRejectsDuplicateEntity() {
        val shelf = Shelf(
            id = "books",
            title = "Books",
            category = CulturalCategory.BOOKS,
        )
        val item = CulturalItem(
            id = "book-1",
            shelfId = shelf.id,
            title = "The Left Hand of Darkness",
            category = CulturalCategory.BOOKS,
            artworkUrl = "https://example.com/book.jpg",
            qlooEntityId = "qloo-book-1",
        )

        val first = LibraryReducer.addItem(listOf(shelf), item)
        val second = LibraryReducer.addItem(first.shelves, item.copy(id = "different-local-id"))

        assertTrue(first.added)
        assertFalse(second.added)
        assertEquals(1, second.shelves.single().items.size)
        assertEquals("https://example.com/book.jpg", second.shelves.single().coverImageUrl)
    }

    @Test
    fun addItem_allowsDifferentManualItemsWithSameTitleInDifferentShelves() {
        val anime = Shelf("anime", "Anime", CulturalCategory.ANIME)
        val books = Shelf("books", "Books", CulturalCategory.BOOKS)
        val animeItem = CulturalItem("anime-1", "anime", "Dune", CulturalCategory.ANIME)
        val bookItem = CulturalItem("book-1", "books", "Dune", CulturalCategory.BOOKS)

        val result = LibraryReducer.addItem(
            LibraryReducer.addItem(listOf(anime, books), animeItem).shelves,
            bookItem,
        )

        assertEquals(1, result.shelves.first { it.id == "anime" }.items.size)
        assertEquals(1, result.shelves.first { it.id == "books" }.items.size)
    }
}
