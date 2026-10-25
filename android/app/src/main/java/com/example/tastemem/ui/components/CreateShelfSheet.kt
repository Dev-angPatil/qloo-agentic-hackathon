package com.example.tastemem.ui.components

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tastemem.data.CulturalCategory
import com.example.tastemem.data.Shelf
import com.example.tastemem.data.newId
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
fun CreateShelfSheet(
    onDismiss: () -> Unit,
    onCreate: (Shelf) -> Unit,
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf(CulturalCategory.ANIME) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SurfaceElevated,
        contentColor = TextPrimary,
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        dragHandle = { Spacer(modifier = Modifier.padding(vertical = 12.dp).height(4.dp).fillMaxWidth(0.12f).background(BorderStrong, RoundedCornerShape(4.dp))) },
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 4.dp)) {
            Text("CREATE A SHELF", color = TextPrimary, fontFamily = FontFamily.Monospace, fontSize = 14.sp, letterSpacing = 1.5.sp)
            Spacer(modifier = Modifier.height(14.dp))
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Shelf name") },
                placeholder = { Text("Late night cinema") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = fieldColors(),
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description (optional)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2,
                maxLines = 3,
                colors = fieldColors(),
            )
            Spacer(modifier = Modifier.height(14.dp))
            Text("DOMAIN", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(CulturalCategory.entries) { option ->
                    val selected = option == category
                    Text(
                        option.displayName,
                        color = if (selected) TextInverted else TextSecondary,
                        fontSize = 12.sp,
                        modifier = Modifier
                            .background(if (selected) AccentWhite else SurfaceCard, RoundedCornerShape(99.dp))
                            .border(1.dp, if (selected) AccentWhite else BorderDefault, RoundedCornerShape(99.dp))
                            .clickable { category = option }
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                    )
                }
            }
            Spacer(modifier = Modifier.height(18.dp))
            Button(
                onClick = {
                    val cleanTitle = title.trim()
                    if (cleanTitle.isNotEmpty()) {
                        onCreate(
                            Shelf(
                                id = newId("shelf"),
                                title = cleanTitle,
                                description = description.trim().takeIf { it.isNotEmpty() },
                                category = category,
                                icon = category.icon,
                                isCustom = category == CulturalCategory.CUSTOM,
                            ),
                        )
                    }
                },
                enabled = title.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted, disabledContainerColor = SurfaceCard, disabledContentColor = TextMuted),
                shape = RoundedCornerShape(18.dp),
            ) { Text("CREATE SHELF", fontFamily = FontFamily.Monospace, fontSize = 12.sp, letterSpacing = 1.sp) }
            Spacer(modifier = Modifier.height(28.dp))
        }
    }
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = AccentWhite,
    unfocusedBorderColor = BorderDefault,
    focusedLabelColor = TextSecondary,
    unfocusedLabelColor = TextMuted,
    focusedTextColor = TextPrimary,
    unfocusedTextColor = TextPrimary,
    cursorColor = AccentWhite,
)
