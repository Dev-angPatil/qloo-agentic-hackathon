package com.example.tastemem.ui.shelf

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import com.example.tastemem.data.CulturalItem
import com.example.tastemem.data.ItemStatus
import com.example.tastemem.data.Shelf
import com.example.tastemem.theme.AccentWhite
import com.example.tastemem.theme.BorderDefault
import com.example.tastemem.theme.BorderSubtle
import com.example.tastemem.theme.BorderStrong
import com.example.tastemem.theme.CanvasBlack
import com.example.tastemem.theme.SurfaceCard
import com.example.tastemem.theme.SurfaceElevated
import com.example.tastemem.theme.TextInverted
import com.example.tastemem.theme.TextMuted
import com.example.tastemem.theme.TextPrimary
import com.example.tastemem.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShelfDetailScreen(
    shelf: Shelf,
    onBack: () -> Unit,
    onAdd: () -> Unit,
    onUpdateItem: (CulturalItem) -> Unit,
    onDeleteItem: (CulturalItem) -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var favoriteOnly by remember { mutableStateOf(false) }
    var selectedItem by remember { mutableStateOf<CulturalItem?>(null) }
    val visibleItems = shelf.items.filter { item ->
        (query.isBlank() || item.title.contains(query, ignoreCase = true) || item.tags.any { it.contains(query, ignoreCase = true) }) &&
            (!favoriteOnly || item.favorite)
    }

    Column(modifier = Modifier.fillMaxSize().background(CanvasBlack).padding(horizontal = 18.dp)) {
        Row(modifier = Modifier.fillMaxWidth().padding(top = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Text("‹", color = TextPrimary, fontSize = 34.sp, fontWeight = FontWeight.Light) }
            Column(modifier = Modifier.weight(1f)) {
                Text(shelf.title.uppercase(), color = TextPrimary, fontFamily = FontFamily.Monospace, fontSize = 14.sp, letterSpacing = 1.5.sp)
                Text("${shelf.itemCount} MEMORIES  •  ${shelf.category.displayName.uppercase()}", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
            }
            TextButton(onClick = onAdd) { Text("+ ADD", color = AccentWhite, fontFamily = FontFamily.Monospace, fontSize = 11.sp) }
        }
        Spacer(modifier = Modifier.height(14.dp))
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search this shelf", color = TextMuted) },
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentWhite, unfocusedBorderColor = BorderDefault, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = AccentWhite),
        )
        Spacer(modifier = Modifier.height(10.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            FilterChip(label = "ALL", selected = !favoriteOnly) { favoriteOnly = false }
            Spacer(modifier = Modifier.width(8.dp))
            FilterChip(label = "★ FAVORITES", selected = favoriteOnly) { favoriteOnly = true }
        }
        Spacer(modifier = Modifier.height(12.dp))
        if (visibleItems.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(if (shelf.items.isEmpty()) "Nothing here yet. Add a memory." else "No memories match this filter.", color = TextSecondary, fontSize = 14.sp)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(bottom = 32.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(visibleItems, key = { it.id }) { item -> ItemCard(item) { selectedItem = item } }
            }
        }
    }

    selectedItem?.let { item ->
        ItemDetailSheet(
            item = item,
            onDismiss = { selectedItem = null },
            onSave = { updated -> onUpdateItem(updated); selectedItem = null },
            onDelete = { onDeleteItem(item); selectedItem = null },
        )
    }
}

@Composable
private fun FilterChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Text(label, color = if (selected) TextInverted else TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp,
        modifier = Modifier.clip(RoundedCornerShape(99.dp)).background(if (selected) AccentWhite else SurfaceCard).border(1.dp, if (selected) AccentWhite else BorderDefault, RoundedCornerShape(99.dp)).clickable(onClick = onClick).padding(horizontal = 12.dp, vertical = 7.dp))
}

@Composable
private fun ItemCard(item: CulturalItem, onClick: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(SurfaceCard).border(1.dp, BorderSubtle, RoundedCornerShape(20.dp)).clickable(onClick = onClick).padding(10.dp)) {
        Box(modifier = Modifier.fillMaxWidth().aspectRatio(0.76f).clip(RoundedCornerShape(14.dp)).background(SurfaceElevated)) {
            AsyncImage(model = item.artworkUrl ?: item.localImageUri, contentDescription = item.title, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            if (item.favorite) Text("★", color = AccentWhite, modifier = Modifier.align(Alignment.TopEnd).padding(9.dp), fontSize = 16.sp)
        }
        Spacer(modifier = Modifier.height(9.dp))
        Text(item.title, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
        Text(item.status.label.uppercase(), color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 9.sp, letterSpacing = 0.6.sp)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ItemDetailSheet(
    item: CulturalItem,
    onDismiss: () -> Unit,
    onSave: (CulturalItem) -> Unit,
    onDelete: () -> Unit,
) {
    var journal by remember(item.id) { mutableStateOf(item.journal ?: item.note.orEmpty()) }
    var rating by remember(item.id) { mutableStateOf(item.rating ?: 0) }
    var favorite by remember(item.id) { mutableStateOf(item.favorite) }
    var status by remember(item.id) { mutableStateOf(item.status) }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = SurfaceElevated, contentColor = TextPrimary, shape = RoundedCornerShape(topStart = 30.dp, topEnd = 30.dp), dragHandle = { Spacer(modifier = Modifier.padding(vertical = 12.dp).height(4.dp).fillMaxWidth(0.12f).background(BorderStrong, RoundedCornerShape(4.dp))) }) {
        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp).padding(bottom = 28.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(item.title, color = TextPrimary, fontSize = 21.sp, fontWeight = FontWeight.Bold)
                    Text(listOfNotNull(item.subtitle, item.year).joinToString(" • "), color = TextSecondary, fontSize = 12.sp)
                }
                Text(if (favorite) "★" else "☆", color = AccentWhite, fontSize = 28.sp, modifier = Modifier.clickable { favorite = !favorite })
            }
            Spacer(modifier = Modifier.height(15.dp))
            Text("STATUS", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(7.dp), modifier = Modifier.padding(top = 7.dp)) {
                ItemStatus.entries.forEach { option ->
                    FilterChip(label = option.label.uppercase(), selected = option == status) { status = option }
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
            Text("RATING", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
            Row(modifier = Modifier.padding(top = 4.dp)) { (1..5).forEach { star -> Text(if (star <= rating) "★" else "☆", color = AccentWhite, fontSize = 28.sp, modifier = Modifier.clickable { rating = star }.padding(end = 4.dp)) } }
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = journal, onValueChange = { journal = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Private journal") }, placeholder = { Text("What stayed with you?") }, minLines = 4, maxLines = 8, colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentWhite, unfocusedBorderColor = BorderDefault, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = AccentWhite))
            Spacer(modifier = Modifier.height(14.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                Button(onClick = onDelete, modifier = Modifier.weight(0.8f).height(48.dp), colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard, contentColor = TextSecondary), shape = RoundedCornerShape(16.dp)) { Text("DELETE", fontFamily = FontFamily.Monospace, fontSize = 11.sp) }
                Button(onClick = { onSave(item.copy(journal = journal.trim().takeIf { it.isNotEmpty() }, note = journal.trim().takeIf { it.isNotEmpty() }, rating = rating.takeIf { it > 0 }, favorite = favorite, status = status)) }, modifier = Modifier.weight(1.2f).height(48.dp), colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted), shape = RoundedCornerShape(16.dp)) { Text("SAVE MEMORY", fontFamily = FontFamily.Monospace, fontSize = 11.sp) }
            }
        }
    }
}
