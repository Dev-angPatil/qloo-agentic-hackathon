package com.example.tastemem.ui.recommendations

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import com.example.tastemem.data.RecommendationMode
import com.example.tastemem.data.Shelf
import com.example.tastemem.data.remote.RecommendationDto
import com.example.tastemem.theme.AccentWhite
import com.example.tastemem.theme.BorderDefault
import com.example.tastemem.theme.BorderSubtle
import com.example.tastemem.theme.CanvasBlack
import com.example.tastemem.theme.SurfaceCard
import com.example.tastemem.theme.SurfaceElevated
import com.example.tastemem.theme.TextInverted
import com.example.tastemem.theme.TextMuted
import com.example.tastemem.theme.TextPrimary
import com.example.tastemem.theme.TextSecondary

@Composable
fun TasteCompassScreen(
    shelves: List<Shelf>,
    results: List<RecommendationDto>,
    isLoading: Boolean,
    error: String?,
    onBack: () -> Unit,
    onRequest: (RecommendationMode, String?, String?) -> Unit,
    onPin: (RecommendationDto, String) -> Unit,
) {
    var mode by remember { mutableStateOf(RecommendationMode.MORE_LIKE_THIS) }
    var selectedShelfId by remember(shelves) { mutableStateOf(shelves.firstOrNull()?.id) }
    var city by remember { mutableStateOf("") }
    var destinationShelfId by remember(shelves, results) { mutableStateOf(shelves.firstOrNull()?.id) }

    Column(modifier = Modifier.fillMaxSize().background(CanvasBlack).padding(horizontal = 18.dp)) {
        Row(modifier = Modifier.fillMaxWidth().padding(top = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("‹ BACK", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 11.sp) }
            Column(modifier = Modifier.weight(1f)) {
                Text("TASTE COMPASS", color = TextPrimary, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
                Text("QLOO CULTURAL INTELLIGENCE", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 9.sp, letterSpacing = 0.8.sp)
            }
            Text("${results.size} RESULTS", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 9.sp)
        }
        Spacer(modifier = Modifier.height(18.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.fillMaxSize()) {
            item {
                Text("CHOOSE A MODE", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
                Spacer(modifier = Modifier.height(9.dp))
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    RecommendationMode.entries.forEach { option ->
                        ModeRow(option, selected = option == mode) { mode = option }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text("SEED SHELF", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    shelves.forEach { shelf ->
                        SelectPill(shelf.title, selectedShelfId == shelf.id) { selectedShelfId = shelf.id }
                    }
                }
                if (mode == RecommendationMode.TRIP) {
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(value = city, onValueChange = { city = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Destination") }, placeholder = { Text("Tokyo, London, Kyoto...") }, colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentWhite, unfocusedBorderColor = BorderDefault, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = AccentWhite))
                }
                Spacer(modifier = Modifier.height(14.dp))
                Button(onClick = { onRequest(mode, selectedShelfId, city.takeIf { mode == RecommendationMode.TRIP }) }, enabled = !isLoading && shelves.isNotEmpty(), modifier = Modifier.fillMaxWidth().height(52.dp), colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted, disabledContainerColor = SurfaceCard, disabledContentColor = TextMuted), shape = RoundedCornerShape(18.dp)) {
                    if (isLoading) CircularProgressIndicator(modifier = Modifier.width(20.dp), color = TextInverted, strokeWidth = 2.dp) else Text("ASK QLOO", fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, fontSize = 12.sp, letterSpacing = 1.sp)
                }
                if (error != null) { Spacer(modifier = Modifier.height(10.dp)); Text(error, color = TextSecondary, fontSize = 13.sp) }
                if (results.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(20.dp))
                    Text("DISCOVERIES", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(9.dp))
                    Text("PIN TO", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 9.sp, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) { shelves.forEach { shelf -> SelectPill(shelf.title, destinationShelfId == shelf.id) { destinationShelfId = shelf.id } } }
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
            items(results, key = { it.id }) { recommendation -> RecommendationCard(recommendation) { destinationShelfId?.let { onPin(recommendation, it) } } }
            item { Spacer(modifier = Modifier.height(28.dp)) }
        }
    }
}

@Composable
private fun ModeRow(mode: RecommendationMode, selected: Boolean, onClick: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(if (selected) SurfaceElevated else SurfaceCard).border(1.dp, if (selected) BorderDefault else BorderSubtle, RoundedCornerShape(16.dp)).clickable(onClick = onClick).padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
        Text("${mode.ordinal + 1}".padStart(2, '0'), color = if (selected) TextPrimary else TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
        Spacer(modifier = Modifier.width(13.dp))
        Column(modifier = Modifier.weight(1f)) { Text(mode.label.uppercase(), color = TextPrimary, fontFamily = FontFamily.Monospace, fontSize = 12.sp, fontWeight = FontWeight.Bold); Text(mode.description, color = TextSecondary, fontSize = 12.sp) }
        Text(if (selected) "●" else "○", color = if (selected) AccentWhite else TextMuted, fontSize = 14.sp)
    }
}

@Composable
private fun SelectPill(label: String, selected: Boolean, onClick: () -> Unit) {
    Text(label, color = if (selected) TextInverted else TextSecondary, fontSize = 11.sp, modifier = Modifier.clip(RoundedCornerShape(99.dp)).background(if (selected) AccentWhite else SurfaceCard).border(1.dp, if (selected) AccentWhite else BorderDefault, RoundedCornerShape(99.dp)).clickable(onClick = onClick).padding(horizontal = 11.dp, vertical = 7.dp), maxLines = 1)
}

@Composable
private fun RecommendationCard(recommendation: RecommendationDto, onPin: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(SurfaceCard).border(1.dp, BorderSubtle, RoundedCornerShape(22.dp)).padding(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(92.dp, 116.dp).clip(RoundedCornerShape(14.dp)).background(SurfaceElevated)) { AsyncImage(model = recommendation.artworkUrl, contentDescription = recommendation.title, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop) }
            Spacer(modifier = Modifier.width(13.dp))
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text("${recommendation.affinity}% AFFINITY", color = AccentWhite, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 0.7.sp)
                Text(recommendation.title, color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold, maxLines = 2)
                Text(listOfNotNull(recommendation.domain.displayName, recommendation.subtitle, recommendation.year).joinToString(" • "), color = TextSecondary, fontSize = 12.sp)
                Button(onClick = onPin, modifier = Modifier.height(34.dp), contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp), colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted), shape = RoundedCornerShape(10.dp)) { Text("+ PIN", fontFamily = FontFamily.Monospace, fontSize = 10.sp) }
            }
        }
        recommendation.reasoning?.let { reason -> Spacer(modifier = Modifier.height(10.dp)); Text(reason, color = TextSecondary, fontSize = 12.sp, lineHeight = 17.sp) }
    }
}
