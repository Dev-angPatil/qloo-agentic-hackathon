package com.example.tastemem.data

import kotlinx.serialization.Serializable

@Serializable
enum class CulturalCategory(
    val displayName: String,
    val icon: String,
    val qlooType: String,
) {
    ANIME("Anime", "Tv", "urn:entity:tv_show"),
    FILMS("Film & TV", "Film", "urn:entity:movie"),
    BOOKS("Books", "BookOpen", "urn:entity:book"),
    MUSIC("Music", "Music", "urn:entity:music_artist"),
    PLACES("Places", "MapPin", "urn:entity:place"),
    CUSTOM("Custom", "Sparkles", ""),
}

@Serializable
enum class ItemStatus(val label: String) {
    PLANNED("Planned"),
    IN_PROGRESS("In progress"),
    COMPLETED("Completed"),
    PAUSED("Paused"),
    DROPPED("Dropped"),
}

@Serializable
data class CulturalItem(
    val id: String,
    val shelfId: String,
    val title: String,
    val category: CulturalCategory,
    val artworkUrl: String? = null,
    val localImageUri: String? = null,
    val year: String? = null,
    val subtitle: String? = null,
    val description: String? = null,
    val journal: String? = null,
    val note: String? = null,
    val tags: List<String> = emptyList(),
    val status: ItemStatus = ItemStatus.COMPLETED,
    val rating: Int? = null,
    val favorite: Boolean = false,
    val createdAt: Long = 0L,
    val qlooEntityId: String? = null,
    val sourceUrl: String? = null,
) {
    /** Compatibility alias for the original prototype and older callers. */
    val posterUrl: String get() = artworkUrl.orEmpty()
}

@Serializable
data class Shelf(
    val id: String,
    val title: String,
    val category: CulturalCategory,
    val description: String? = null,
    val icon: String = "Sparkles",
    val coverImageUrl: String? = null,
    val positionX: Float = 0f,
    val positionY: Float = 0f,
    val isCustom: Boolean = false,
    val isHidden: Boolean = false,
    val items: List<CulturalItem> = emptyList(),
) {
    val itemCount: Int get() = items.size
    val heroImageUrl: String?
        get() = coverImageUrl ?: items.firstOrNull()?.artworkUrl ?: items.firstOrNull()?.localImageUri

    /** Compatibility alias for the original prototype. */
    val posterUrl: String get() = heroImageUrl.orEmpty()
}
