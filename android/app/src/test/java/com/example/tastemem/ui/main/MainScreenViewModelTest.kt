package com.example.tastemem.ui.main

import com.example.tastemem.data.CulturalCategory
import com.example.tastemem.data.CulturalItem
import com.example.tastemem.data.ItemStatus
import com.example.tastemem.data.InMemoryTasteMemRepository
import com.example.tastemem.data.Shelf
import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertFalse
import junit.framework.TestCase.assertTrue
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Test

@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
class MainScreenViewModelTest {
    @Test
    fun uiState_startsWithAnEmptyLibrary() = runTest {
        val viewModel = MainScreenViewModel(InMemoryTasteMemRepository())
        val state = viewModel.uiState.first()
        assertTrue(state.shelves.isEmpty())
        assertFalse(state.showSmartAdd)
    }

    @Test
    fun uiState_smartAddToggle() = runTest {
        val viewModel = MainScreenViewModel(InMemoryTasteMemRepository())
        viewModel.openSmartAdd()
        assertTrue(viewModel.uiState.first().showSmartAdd)

        viewModel.dismissSmartAdd()
        assertFalse(viewModel.uiState.first().showSmartAdd)
    }

    @Test
    fun uiState_addItemToShelf_preventsDuplicateAndKeepsJournalFields() = runTest {
        val shelf = Shelf(
            id = "shelf-anime",
            title = "Anime",
            category = CulturalCategory.ANIME,
        )
        val repository = InMemoryTasteMemRepository(listOf(shelf))
        val viewModel = MainScreenViewModel(repository)
        val newItem = CulturalItem(
            id = "new-anime",
            shelfId = shelf.id,
            title = "Jujutsu Kaisen",
            category = CulturalCategory.ANIME,
            artworkUrl = "https://example.com/jjk.jpg",
            year = "2020",
            journal = "Domain Expansion",
            status = ItemStatus.COMPLETED,
            rating = 5,
            qlooEntityId = "qloo-uuid-jjk"
        )

        viewModel.addItemToShelf(newItem)
        viewModel.addItemToShelf(newItem)
        advanceUntilIdle()
        val state = viewModel.uiState.first()
        val animeShelf = state.shelves.first { it.category == CulturalCategory.ANIME }

        assertEquals("https://example.com/jjk.jpg", animeShelf.coverImageUrl)
        assertEquals(1, animeShelf.itemCount)
        assertEquals("Jujutsu Kaisen", animeShelf.items.first().title)
        assertEquals("Domain Expansion", animeShelf.items.first().journal)
        assertEquals(5, animeShelf.items.first().rating)
    }
}
