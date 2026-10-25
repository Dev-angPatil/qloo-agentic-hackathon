package com.example.tastemem.data

data class AddItemResult(
    val shelves: List<Shelf>,
    val added: Boolean,
)

object LibraryReducer {
    fun addItem(shelves: List<Shelf>, item: CulturalItem): AddItemResult {
        var added = false
        val updated = shelves.map { shelf ->
            if (shelf.id != item.shelfId) return@map shelf

            val duplicate = shelf.items.any { existing ->
                when {
                    !item.qlooEntityId.isNullOrBlank() && !existing.qlooEntityId.isNullOrBlank() ->
                        item.qlooEntityId == existing.qlooEntityId
                    else -> existing.title.trim().equals(item.title.trim(), ignoreCase = true)
                }
            }
            if (duplicate) return@map shelf

            added = true
            shelf.copy(
                coverImageUrl = item.artworkUrl ?: item.localImageUri ?: shelf.coverImageUrl,
                items = listOf(item) + shelf.items,
            )
        }
        return AddItemResult(updated, added)
    }

    fun updateItem(shelves: List<Shelf>, item: CulturalItem): List<Shelf> = shelves.map { shelf ->
        if (shelf.id != item.shelfId) shelf
        else shelf.copy(
            coverImageUrl = if (shelf.coverImageUrl == null) item.artworkUrl ?: item.localImageUri else shelf.coverImageUrl,
            items = shelf.items.map { existing -> if (existing.id == item.id) item else existing },
        )
    }

    fun deleteItem(shelves: List<Shelf>, shelfId: String, itemId: String): List<Shelf> = shelves.map { shelf ->
        if (shelf.id != shelfId) shelf else shelf.copy(items = shelf.items.filterNot { it.id == itemId })
    }
}
