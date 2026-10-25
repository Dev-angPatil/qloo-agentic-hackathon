package com.example.tastemem.data

enum class RecommendationMode(val label: String, val description: String) {
    MORE_LIKE_THIS("More like this", "Stay close to a shelf or item you already love."),
    SURPRISE("Surprise me", "Find lower-popularity hidden gems in the selected domain."),
    GO_WILD("Go wild", "Let Qloo bridge your taste into an unexpected category."),
    TRIP("Trip guide", "Ground your taste in a city or destination."),
}

data class RecommendationRequest(
    val mode: RecommendationMode,
    val signalEntityIds: List<String>,
    val targetCategory: CulturalCategory? = null,
    val location: String? = null,
    val seedItemIds: List<String> = emptyList(),
    val take: Int = 6,
)

object RecommendationRequestBuilder {
    fun build(
        mode: RecommendationMode,
        shelves: List<Shelf>,
        selectedShelfId: String?,
        selectedItemIds: List<String> = emptyList(),
        targetCategory: CulturalCategory? = null,
        location: String? = null,
    ): RecommendationRequest {
        val selectedShelf = shelves.firstOrNull { it.id == selectedShelfId }
        val selectedItems = if (selectedItemIds.isEmpty()) {
            selectedShelf?.items.orEmpty()
        } else {
            shelves.flatMap { it.items }.filter { it.id in selectedItemIds }
        }
        val sourceItems = when (mode) {
            RecommendationMode.GO_WILD -> shelves.flatMap { it.items }
            else -> selectedItems
        }
        val entityIds = sourceItems.mapNotNull { it.qlooEntityId }.distinct()
        return RecommendationRequest(
            mode = mode,
            signalEntityIds = entityIds,
            targetCategory = when (mode) {
                RecommendationMode.TRIP -> CulturalCategory.PLACES
                RecommendationMode.MORE_LIKE_THIS, RecommendationMode.SURPRISE -> targetCategory ?: selectedShelf?.category
                RecommendationMode.GO_WILD -> targetCategory
            },
            location = if (mode == RecommendationMode.TRIP) location?.trim()?.takeIf { it.isNotEmpty() } else null,
            seedItemIds = selectedItems.map { it.id },
            take = 6,
        )
    }
}
