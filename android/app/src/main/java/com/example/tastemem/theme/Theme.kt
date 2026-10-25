package com.example.tastemem.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val TasteMemDarkColorScheme = darkColorScheme(
    primary = AccentWhite,
    onPrimary = TextInverted,
    primaryContainer = SurfaceElevated,
    onPrimaryContainer = TextPrimary,
    secondary = TextSecondary,
    onSecondary = TextInverted,
    background = CanvasBlack,
    onBackground = TextPrimary,
    surface = SurfaceCard,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceElevated,
    onSurfaceVariant = TextSecondary,
    outline = BorderDefault,
    outlineVariant = BorderSubtle
)

@Composable
fun TasteMemTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = TasteMemDarkColorScheme,
        typography = Typography,
        content = content
    )
}
