package com.example.tastemem.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.tastemem.data.CulturalCategory
import com.example.tastemem.data.CulturalItem
import com.example.tastemem.data.RecommendationMode
import com.example.tastemem.data.RecommendationRequestBuilder
import com.example.tastemem.data.Shelf
import com.example.tastemem.data.TasteMemRepository
import com.example.tastemem.data.remote.RecommendationDto
import com.example.tastemem.data.remote.SearchResultDto
import com.example.tastemem.data.remote.TasteMemApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TasteMemUiState(
    val shelves: List<Shelf> = emptyList(),
    val activeShelf: Shelf? = null,
    val showSmartAdd: Boolean = false,
    val showCreateShelf: Boolean = false,
    val showSettings: Boolean = false,
    val showCompass: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val searchResults: List<SearchResultDto> = emptyList(),
    val isSearching: Boolean = false,
    val searchError: String? = null,
    val recommendationMode: RecommendationMode = RecommendationMode.MORE_LIKE_THIS,
    val recommendations: List<RecommendationDto> = emptyList(),
    val isLoadingRecommendations: Boolean = false,
    val recommendationError: String? = null,
)

class MainScreenViewModel(
    private val repository: TasteMemRepository,
    private val api: TasteMemApi? = null,
) : ViewModel() {
    private val _uiState = MutableStateFlow(TasteMemUiState())
    val uiState: StateFlow<TasteMemUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.shelves.collect { shelves ->
                _uiState.update { state ->
                    state.copy(
                        shelves = shelves,
                        activeShelf = state.activeShelf?.let { active -> shelves.firstOrNull { it.id == active.id } },
                    )
                }
            }
        }
    }

    fun openSmartAdd() = _uiState.update { it.copy(showSmartAdd = true) }

    fun dismissSmartAdd() = _uiState.update { it.copy(showSmartAdd = false, searchQuery = "", searchResults = emptyList(), searchError = null) }

    fun openCreateShelf() = _uiState.update { it.copy(showCreateShelf = true) }

    fun dismissCreateShelf() = _uiState.update { it.copy(showCreateShelf = false) }

    fun openSettings() = _uiState.update { it.copy(showSettings = true) }

    fun dismissSettings() = _uiState.update { it.copy(showSettings = false) }

    fun openCompass() = _uiState.update { it.copy(showCompass = true) }

    fun dismissCompass() = _uiState.update { it.copy(showCompass = false) }

    fun selectShelf(shelf: Shelf) = _uiState.update { it.copy(activeShelf = shelf) }

    fun dismissShelfDetail() = _uiState.update { it.copy(activeShelf = null) }

    fun addShelf(shelf: Shelf) {
        viewModelScope.launch {
            repository.createShelf(shelf)
            _uiState.update { it.copy(showCreateShelf = false) }
        }
    }

    fun updateShelf(shelf: Shelf) {
        viewModelScope.launch { repository.updateShelf(shelf) }
    }

    fun deleteShelf(shelf: Shelf) {
        viewModelScope.launch { repository.deleteShelf(shelf.id) }
    }

    fun addItemToShelf(item: CulturalItem) {
        viewModelScope.launch {
            val result = repository.addItem(item)
            if (result.added && api != null && item.qlooEntityId == null && item.category != CulturalCategory.CUSTOM) {
                api.resolveQloo(item.title, item.category).getOrNull()?.let { entityId ->
                    repository.updateItem(item.copy(qlooEntityId = entityId))
                }
            }
            _uiState.update { it.copy(showSmartAdd = false) }
        }
    }

    fun updateItem(item: CulturalItem) {
        viewModelScope.launch { repository.updateItem(item) }
    }

    fun deleteItem(item: CulturalItem) {
        viewModelScope.launch { repository.deleteItem(item.shelfId, item.id) }
    }

    fun clearLibrary() {
        viewModelScope.launch { repository.clear() }
    }

    fun search(query: String) {
        _uiState.update { it.copy(searchQuery = query, searchError = null) }
        if (query.trim().length < 2 || api == null) {
            _uiState.update { it.copy(searchResults = emptyList(), isSearching = false) }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isSearching = true) }
            api.search(query).fold(
                onSuccess = { results -> _uiState.update { it.copy(searchResults = results, isSearching = false) } },
                onFailure = { error -> _uiState.update { it.copy(isSearching = false, searchError = error.message ?: "Search is unavailable") } },
            )
        }
    }

    fun loadRecommendations(
        mode: RecommendationMode,
        selectedShelfId: String?,
        targetCategory: CulturalCategory? = null,
        location: String? = null,
    ) {
        val activeShelves = _uiState.value.shelves
        val request = RecommendationRequestBuilder.build(
            mode = mode,
            shelves = activeShelves,
            selectedShelfId = selectedShelfId,
            targetCategory = targetCategory,
            location = location,
        )
        _uiState.update {
            it.copy(
                recommendationMode = mode,
                recommendations = emptyList(),
                isLoadingRecommendations = true,
                recommendationError = if (request.signalEntityIds.isEmpty()) "Add at least one linked memory first." else null,
            )
        }
        if (request.signalEntityIds.isEmpty() || api == null) {
            _uiState.update { it.copy(isLoadingRecommendations = false) }
            return
        }
        viewModelScope.launch {
            api.recommendations(request).fold(
                onSuccess = { results -> _uiState.update { it.copy(recommendations = results, isLoadingRecommendations = false) } },
                onFailure = { error -> _uiState.update { it.copy(isLoadingRecommendations = false, recommendationError = error.message ?: "Recommendations are unavailable") } },
            )
        }
    }

    fun pinRecommendation(recommendation: RecommendationDto, shelfId: String) {
        addItemToShelf(
            CulturalItem(
                id = "recommendation-${recommendation.id}",
                shelfId = shelfId,
                title = recommendation.title,
                category = recommendation.domain,
                artworkUrl = recommendation.artworkUrl,
                subtitle = recommendation.subtitle,
                description = recommendation.description,
                year = recommendation.year,
                tags = recommendation.tags,
            ),
        )
    }
}
