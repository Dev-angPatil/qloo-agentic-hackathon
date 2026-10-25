package com.example.tastemem.data.remote

import com.example.tastemem.data.CulturalCategory
import com.example.tastemem.data.RecommendationRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class SearchResultDto(
    val id: String,
    val title: String,
    val category: CulturalCategory,
    val artworkUrl: String? = null,
    val subtitle: String? = null,
    val description: String? = null,
    val year: String? = null,
    val sourceUrl: String? = null,
)

data class RecommendationDto(
    val id: String,
    val title: String,
    val domain: CulturalCategory,
    val artworkUrl: String? = null,
    val subtitle: String? = null,
    val description: String? = null,
    val affinity: Int = 0,
    val reasoning: String? = null,
    val year: String? = null,
    val tags: List<String> = emptyList(),
)

interface TasteMemApi {
    suspend fun search(query: String): Result<List<SearchResultDto>>
    suspend fun resolveQloo(title: String, category: CulturalCategory): Result<String?>
    suspend fun recommendations(request: RecommendationRequest): Result<List<RecommendationDto>>
}

class HttpTasteMemApi(
    private val baseUrl: String,
    private val json: Json = Json { ignoreUnknownKeys = true },
) : TasteMemApi {
    override suspend fun search(query: String): Result<List<SearchResultDto>> = runCatching {
        if (query.isBlank()) return@runCatching emptyList()
        coroutineScope {
            CulturalCategory.entries.filter { it != CulturalCategory.CUSTOM }.map { category ->
                async {
                    runCatching {
                        val response = get("/api/search", mapOf("domain" to category.toApiDomain(), "q" to query.trim()))
                        response.jsonObject["results"]?.jsonArray.orEmpty().mapNotNull { element -> parseSearchResult(element.jsonObject, category) }
                    }.getOrDefault(emptyList())
                }
            }.awaitAll().flatten().distinctBy { "${it.category}:${it.id}" }.take(20)
        }
    }

    override suspend fun resolveQloo(title: String, category: CulturalCategory): Result<String?> = runCatching {
        val response = get(
            "/api/qloo/resolve",
            mapOf("query" to title, "domain" to category.toApiDomain()),
        )
        response.jsonObject["entity_id"]?.jsonPrimitive?.contentOrNull
    }

    override suspend fun recommendations(request: RecommendationRequest): Result<List<RecommendationDto>> = runCatching {
        val selectedDomain = request.targetCategory ?: CulturalCategory.FILMS
        val response = get(
            "/api/recommendations",
            buildMap {
                put("mode", request.mode.toApiMode())
                put("seeds", request.signalEntityIds.joinToString(","))
                put("domain", selectedDomain.toApiDomain())
                request.targetCategory?.let { put("targetDomain", it.toApiDomain()) }
                request.location?.let { put("city", it) }
            },
        )
        response.jsonObject["recommendations"]?.jsonArray.orEmpty().map { element ->
            val value = element.jsonObject
            RecommendationDto(
                id = value["id"]?.jsonPrimitive?.content.orEmpty(),
                title = value["title"]?.jsonPrimitive?.content.orEmpty(),
                domain = categoryFor(value["domain"]?.jsonPrimitive?.content.orEmpty()),
                artworkUrl = value["coverImageUrl"]?.jsonPrimitive?.contentOrNull,
                subtitle = value["subtitle"]?.jsonPrimitive?.contentOrNull,
                description = value["description"]?.jsonPrimitive?.contentOrNull,
                affinity = value["affinity"]?.jsonPrimitive?.intOrNull ?: 0,
                reasoning = value["bridgeReasoning"]?.jsonPrimitive?.contentOrNull,
                year = value["year"]?.jsonPrimitive?.contentOrNull,
                tags = value["tags"]?.jsonArray?.mapNotNull { it.jsonPrimitive.contentOrNull }.orEmpty(),
            )
        }.take(request.take)
    }

    private suspend fun get(path: String, params: Map<String, String>): JsonObject = withContext(Dispatchers.IO) {
        val query = params.entries.joinToString("&") { (key, value) ->
            "${encode(key)}=${encode(value)}"
        }
        val url = URL("${baseUrl.trimEnd('/')}$path?$query")
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 4_000
            readTimeout = 8_000
            setRequestProperty("Accept", "application/json")
        }
        try {
            val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (connection.responseCode !in 200..299) error("Gateway returned ${connection.responseCode}")
            json.parseToJsonElement(body).jsonObject
        } finally {
            connection.disconnect()
        }
    }

    private fun encode(value: String): String = URLEncoder.encode(value, Charsets.UTF_8.name())

    private fun parseSearchResult(value: JsonObject, fallbackCategory: CulturalCategory): SearchResultDto? {
        val title = value["title"]?.jsonPrimitive?.contentOrNull?.takeIf { it.isNotBlank() } ?: return null
        return SearchResultDto(
            id = value["externalId"]?.jsonPrimitive?.contentOrNull ?: title,
            title = title,
            category = categoryFor(value["domain"]?.jsonPrimitive?.contentOrNull ?: fallbackCategory.name.lowercase()),
            artworkUrl = value["coverImageUrl"]?.jsonPrimitive?.contentOrNull,
            subtitle = value["subtitle"]?.jsonPrimitive?.contentOrNull,
            description = value["description"]?.jsonPrimitive?.contentOrNull,
            year = value["year"]?.jsonPrimitive?.contentOrNull,
        )
    }
}

private fun CulturalCategory.toApiDomain(): String = when (this) {
    CulturalCategory.ANIME -> "anime"
    CulturalCategory.FILMS -> "movies"
    CulturalCategory.BOOKS -> "books"
    CulturalCategory.MUSIC -> "music"
    CulturalCategory.PLACES -> "places"
    CulturalCategory.CUSTOM -> "custom"
}

private fun com.example.tastemem.data.RecommendationMode.toApiMode(): String = when (this) {
    com.example.tastemem.data.RecommendationMode.MORE_LIKE_THIS -> "more_like_this"
    com.example.tastemem.data.RecommendationMode.SURPRISE -> "surprise_me"
    com.example.tastemem.data.RecommendationMode.GO_WILD -> "go_wild"
    com.example.tastemem.data.RecommendationMode.TRIP -> "trip_guide"
}

private fun categoryFor(domain: String): CulturalCategory = when (domain.lowercase()) {
    "anime", "tv", "tv_show" -> CulturalCategory.ANIME
    "movies", "movie", "cinema" -> CulturalCategory.FILMS
    "books", "book" -> CulturalCategory.BOOKS
    "music", "artist" -> CulturalCategory.MUSIC
    "places", "place" -> CulturalCategory.PLACES
    else -> CulturalCategory.CUSTOM
}
