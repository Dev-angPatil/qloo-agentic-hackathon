package com.example.tastemem.ui.components

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.tastemem.data.CulturalCategory
import com.example.tastemem.data.CulturalItem
import com.example.tastemem.data.ItemStatus
import com.example.tastemem.data.Shelf
import com.example.tastemem.data.newId
import com.example.tastemem.data.remote.SearchResultDto
import com.example.tastemem.theme.AccentWhite
import com.example.tastemem.theme.BorderDefault
import com.example.tastemem.theme.BorderStrong
import com.example.tastemem.theme.SurfaceCard
import com.example.tastemem.theme.SurfaceElevated
import com.example.tastemem.theme.TextInverted
import com.example.tastemem.theme.TextMuted
import com.example.tastemem.theme.TextPrimary
import com.example.tastemem.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmartAddSheet(
    onDismiss: () -> Unit,
    onAddItem: (CulturalItem) -> Unit,
    onAddManual: (CulturalItem) -> Unit = onAddItem,
    shelfId: String? = null,
    shelves: List<Shelf> = emptyList(),
    query: String = "",
    results: List<SearchResultDto> = emptyList(),
    isSearching: Boolean = false,
    error: String? = null,
    onQueryChange: (String) -> Unit = {},
    modifier: Modifier = Modifier,
) {
    var selectedShelfId by remember(shelfId, shelves) { mutableStateOf(shelfId ?: shelves.firstOrNull()?.id) }
    var selectedImageUri by remember { mutableStateOf<String?>(null) }
    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> selectedImageUri = uri?.toString() }
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SurfaceElevated,
        contentColor = TextPrimary,
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        dragHandle = {
            Spacer(
                modifier = Modifier
                    .padding(vertical = 12.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(BorderStrong),
            )
        },
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
        ) {
            Text(
                text = "UNIVERSAL SMART ADD",
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = TextSecondary,
                letterSpacing = 1.5.sp,
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search anime, film, book, music, place...", color = TextMuted, fontSize = 14.sp) },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentWhite,
                    unfocusedBorderColor = BorderDefault,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = AccentWhite,
                ),
            )
            Spacer(modifier = Modifier.height(14.dp))

            if (shelfId == null && shelves.isNotEmpty()) {
                Text("SAVE TO SHELF", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
                Spacer(modifier = Modifier.height(7.dp))
                androidx.compose.foundation.lazy.LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(shelves) { shelf ->
                        val selected = selectedShelfId == shelf.id
                        Text(
                            shelf.title,
                            color = if (selected) TextInverted else TextSecondary,
                            fontSize = 12.sp,
                            modifier = Modifier
                                .clip(RoundedCornerShape(99.dp))
                                .background(if (selected) AccentWhite else SurfaceCard)
                                .border(1.dp, if (selected) AccentWhite else BorderDefault, RoundedCornerShape(99.dp))
                                .clickable { selectedShelfId = shelf.id }
                                .padding(horizontal = 12.dp, vertical = 7.dp),
                        )
                    }
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            when {
                isSearching -> CircularProgressIndicator(
                    modifier = Modifier.size(26.dp).align(Alignment.CenterHorizontally),
                    color = AccentWhite,
                    strokeWidth = 2.dp,
                )
                error != null -> Text(error, color = TextSecondary, fontSize = 13.sp)
                query.isBlank() -> Text("Search your next memory across every shelf.", color = TextMuted, fontSize = 13.sp)
                results.isEmpty() -> {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("No match yet. Create a private custom memory from this title.", color = TextSecondary, fontSize = 13.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("${selectedImageUri?.let { "IMAGE READY" } ?: "OPTIONAL IMAGE"}", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp, modifier = Modifier.clip(RoundedCornerShape(99.dp)).background(SurfaceCard).border(1.dp, BorderDefault, RoundedCornerShape(99.dp)).clickable { imagePicker.launch("image/*") }.padding(horizontal = 12.dp, vertical = 8.dp))
                            Text("CREATE MEMORY", color = TextInverted, fontFamily = FontFamily.Monospace, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clip(RoundedCornerShape(99.dp)).background(AccentWhite).clickable {
                                val destination = shelfId ?: selectedShelfId
                                if (destination != null) onAddManual(CulturalItem(id = newId("custom"), shelfId = destination, title = query.trim(), category = CulturalCategory.CUSTOM, localImageUri = selectedImageUri, status = ItemStatus.COMPLETED))
                            }.padding(horizontal = 12.dp, vertical = 8.dp))
                        }
                    }
                }
                else -> LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth().height(380.dp),
                ) {
                    items(results, key = { it.id }) { result ->
                        SearchResultRow(result) {
                            val destination = shelfId
                                ?: selectedShelfId
                                ?: shelves.firstOrNull { it.category == result.category }?.id
                            if (destination != null) onAddItem(
                                CulturalItem(
                                    id = newId("item"),
                                    shelfId = destination,
                                    title = result.title,
                                    category = result.category,
                                    artworkUrl = result.artworkUrl,
                                    year = result.year,
                                    subtitle = result.subtitle,
                                    description = result.description,
                                    status = ItemStatus.COMPLETED,
                                ),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SearchResultRow(result: SearchResultDto, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(SurfaceCard)
            .border(1.dp, Color(0x1AFFFFFF), RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AsyncImage(
            model = result.artworkUrl,
            contentDescription = result.title,
            modifier = Modifier.size(56.dp).clip(RoundedCornerShape(10.dp)),
            contentScale = ContentScale.Crop,
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(result.title, color = TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            Text(
                listOfNotNull(result.category.displayName, result.subtitle, result.year).joinToString(" • "),
                color = TextSecondary,
                fontSize = 12.sp,
                maxLines = 1,
            )
        }
        Text("+ PIN", color = TextInverted, fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold,
            modifier = Modifier.background(AccentWhite, RoundedCornerShape(99.dp)).padding(horizontal = 10.dp, vertical = 6.dp))
    }
}
