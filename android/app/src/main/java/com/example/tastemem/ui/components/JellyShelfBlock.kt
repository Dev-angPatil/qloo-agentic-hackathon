package com.example.tastemem.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.IntOffset
import coil.compose.AsyncImage
import com.example.tastemem.data.Shelf
import com.example.tastemem.theme.*
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

/**
 * 1:1 Squircle Single-Poster Jelly Vault card.
 * Features soft-body jelly squash & stretch physics matching DESIGN.md tokens.
 */
@Composable
fun JellyShelfBlock(
    shelf: Shelf,
    onClick: () -> Unit,
    onPositionChanged: (Shelf) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val hapticFeedback = LocalHapticFeedback.current
    val scaleX = remember { Animatable(1f) }
    val scaleY = remember { Animatable(1f) }
    var offsetX by remember(shelf.id) { mutableStateOf(shelf.positionX) }
    var offsetY by remember(shelf.id) { mutableStateOf(shelf.positionY) }

    val jellySpring = spring<Float>(
        dampingRatio = 0.55f, // DESIGN.md spring-jelly
        stiffness = 300f
    )

    Card(
        modifier = modifier
            .aspectRatio(1f)
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .graphicsLayer {
                this.scaleX = scaleX.value
                this.scaleY = scaleY.value
            }
            .clickable {
                hapticFeedback.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                coroutineScope.launch {
                    scaleX.animateTo(1.04f, spring(stiffness = 600f))
                    scaleY.animateTo(0.95f, spring(stiffness = 600f))
                    scaleX.animateTo(1f, jellySpring)
                    scaleY.animateTo(1f, jellySpring)
                }
                onClick()
            }
            .pointerInput(Unit) {
                detectDragGestures(
                    onDrag = { change, dragAmount ->
                        change.consume()
                        offsetX = (offsetX + dragAmount.x).coerceIn(-80f, 80f)
                        offsetY = (offsetY + dragAmount.y).coerceIn(-80f, 80f)
                    },
                    onDragEnd = { onPositionChanged(shelf.copy(positionX = offsetX, positionY = offsetY)) },
                )
            },
        shape = RoundedCornerShape(28.dp),
        border = BorderStroke(1.dp, BorderDefault),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Background cover poster
            if (shelf.posterUrl.isNotBlank()) {
                AsyncImage(
                    model = shelf.posterUrl,
                    contentDescription = shelf.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(SurfaceElevated),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = shelf.category.name.take(2),
                        style = TextStyle(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 32.sp,
                            color = TextMuted
                        )
                    )
                }
            }

            // High-contrast gradient protection overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xCC000000),
                                Color(0x22000000),
                                Color(0x99000000),
                                Color(0xF0000000)
                            )
                        )
                    )
            )

            // Content overlay
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(14.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top bar: Dot matrix category + count pill
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = ":: ${shelf.category.displayName.uppercase()}",
                        color = TextSecondary,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.sp
                    )

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(99.dp))
                            .background(Color(0x33FFFFFF))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "[${shelf.itemCount}]",
                            color = TextPrimary,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Bottom bar: Shelf Title & Active Cover Note
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        text = shelf.title,
                        color = TextPrimary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    val subtitle = shelf.items.firstOrNull()?.title ?: "Empty Shelf"
                    Text(
                        text = subtitle,
                        color = TextSecondary,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        maxLines = 1
                    )
                }
            }
        }
    }
}
