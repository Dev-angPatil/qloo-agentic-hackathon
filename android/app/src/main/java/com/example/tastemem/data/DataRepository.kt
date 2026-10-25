package com.example.tastemem.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.util.UUID

private const val LIBRARY_KEY = "library_json_v2"

@Serializable
private data class LibrarySnapshot(
    val schemaVersion: Int = 2,
    val shelves: List<Shelf> = emptyList(),
)

interface TasteMemRepository {
    val shelves: StateFlow<List<Shelf>>

    suspend fun createShelf(shelf: Shelf)
    suspend fun updateShelf(shelf: Shelf)
    suspend fun deleteShelf(shelfId: String)
    suspend fun addItem(item: CulturalItem): AddItemResult
    suspend fun updateItem(item: CulturalItem)
    suspend fun deleteItem(shelfId: String, itemId: String)
    suspend fun clear()
    suspend fun exportJson(): String
    suspend fun importJson(json: String): Result<Unit>
}

open class InMemoryTasteMemRepository(initialShelves: List<Shelf> = emptyList()) : TasteMemRepository {
    private val _shelves = MutableStateFlow(initialShelves)
    override val shelves: StateFlow<List<Shelf>> = _shelves.asStateFlow()

    override suspend fun createShelf(shelf: Shelf) {
        if (_shelves.value.none { it.id == shelf.id }) _shelves.value = _shelves.value + shelf
    }

    override suspend fun updateShelf(shelf: Shelf) {
        _shelves.value = _shelves.value.map { if (it.id == shelf.id) shelf else it }
    }

    override suspend fun deleteShelf(shelfId: String) {
        _shelves.value = _shelves.value.filterNot { it.id == shelfId }
    }

    override suspend fun addItem(item: CulturalItem): AddItemResult {
        val result = LibraryReducer.addItem(_shelves.value, item)
        if (result.added) _shelves.value = result.shelves
        return result
    }

    override suspend fun updateItem(item: CulturalItem) {
        _shelves.value = LibraryReducer.updateItem(_shelves.value, item)
    }

    override suspend fun deleteItem(shelfId: String, itemId: String) {
        _shelves.value = LibraryReducer.deleteItem(_shelves.value, shelfId, itemId)
    }

    override suspend fun clear() {
        _shelves.value = emptyList()
    }

    override suspend fun exportJson(): String = Json.encodeToString(LibrarySnapshot(shelves = _shelves.value))

    override suspend fun importJson(json: String): Result<Unit> = runCatching {
        val snapshot = Json.decodeFromString<LibrarySnapshot>(json)
        _shelves.value = snapshot.shelves
    }
}

class LocalTasteMemRepository(
    context: Context,
    private val json: Json = Json { ignoreUnknownKeys = true },
) : InMemoryTasteMemRepository(loadShelves(context, json)) {
    private val preferences: SharedPreferences = context.getSharedPreferences("tastemem", Context.MODE_PRIVATE)

    override suspend fun createShelf(shelf: Shelf) {
        super.createShelf(shelf)
        persist()
    }

    override suspend fun updateShelf(shelf: Shelf) {
        super.updateShelf(shelf)
        persist()
    }

    override suspend fun deleteShelf(shelfId: String) {
        super.deleteShelf(shelfId)
        persist()
    }

    override suspend fun addItem(item: CulturalItem): AddItemResult {
        val result = super.addItem(item)
        if (result.added) persist()
        return result
    }

    override suspend fun updateItem(item: CulturalItem) {
        super.updateItem(item)
        persist()
    }

    override suspend fun deleteItem(shelfId: String, itemId: String) {
        super.deleteItem(shelfId, itemId)
        persist()
    }

    override suspend fun clear() {
        super.clear()
        persist()
    }

    override suspend fun importJson(jsonText: String): Result<Unit> = super.importJson(jsonText).onSuccess { persist() }

    private fun persist() {
        preferences.edit().putString(LIBRARY_KEY, json.encodeToString(LibrarySnapshot(shelves = shelves.value))).apply()
    }

    companion object {
        private fun loadShelves(context: Context, json: Json): List<Shelf> {
            val raw = context.getSharedPreferences("tastemem", Context.MODE_PRIVATE).getString(LIBRARY_KEY, null)
                ?: return emptyList()
            return runCatching { json.decodeFromString<LibrarySnapshot>(raw).shelves }.getOrDefault(emptyList())
        }
    }
}

class GatewaySettings(context: Context) {
    private val preferences = context.getSharedPreferences("tastemem_settings", Context.MODE_PRIVATE)

    var baseUrl: String
        get() = preferences.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
        set(value) { preferences.edit().putString(KEY_BASE_URL, value.trim().trimEnd('/')).apply() }

    companion object {
        const val DEFAULT_BASE_URL = "http://10.0.2.2:3000"
        private const val KEY_BASE_URL = "gateway_base_url"
    }
}

fun newId(prefix: String): String = "$prefix-${UUID.randomUUID()}"
