package com.example.tastemem.ui.components

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tastemem.data.GatewaySettings
import com.example.tastemem.data.Shelf
import com.example.tastemem.data.TasteMemRepository
import com.example.tastemem.theme.AccentWhite
import com.example.tastemem.theme.BorderDefault
import com.example.tastemem.theme.BorderStrong
import com.example.tastemem.theme.SurfaceCard
import com.example.tastemem.theme.SurfaceElevated
import com.example.tastemem.theme.TextInverted
import com.example.tastemem.theme.TextMuted
import com.example.tastemem.theme.TextPrimary
import com.example.tastemem.theme.TextSecondary
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsSheet(
    repository: TasteMemRepository,
    shelves: List<Shelf> = emptyList(),
    onUpdateShelf: (Shelf) -> Unit = {},
    onDeleteShelf: (Shelf) -> Unit = {},
    onDismiss: () -> Unit,
    onCleared: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val gatewaySettings = remember(context) { GatewaySettings(context.applicationContext) }
    var gatewayUrl by remember { mutableStateOf(gatewaySettings.baseUrl) }
    var showClearConfirmation by remember { mutableStateOf(false) }
    val importLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) scope.launch {
            context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }?.let { repository.importJson(it) }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SurfaceElevated,
        contentColor = TextPrimary,
        shape = RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        dragHandle = { Spacer(modifier = Modifier.padding(vertical = 12.dp).height(4.dp).fillMaxWidth(0.12f).background(BorderStrong, RoundedCornerShape(4.dp))) },
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("SETTINGS", color = TextPrimary, fontFamily = FontFamily.Monospace, fontSize = 14.sp, letterSpacing = 1.5.sp)
            Text("LOCAL VAULT", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                ActionButton("EXPORT JSON", modifier = Modifier.weight(1f)) {
                    scope.launch {
                        val payload = repository.exportJson()
                        context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                            type = "application/json"
                            putExtra(Intent.EXTRA_TEXT, payload)
                        }, "Export TasteMem vault"))
                    }
                }
                ActionButton("IMPORT", modifier = Modifier.weight(1f)) { importLauncher.launch(arrayOf("application/json", "text/plain")) }
                ActionButton("RESET", modifier = Modifier.weight(1f), destructive = true) { showClearConfirmation = true }
            }
            Text("LOCAL GATEWAY", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
            OutlinedTextField(
                value = gatewayUrl,
                onValueChange = { gatewayUrl = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text(GatewaySettings.DEFAULT_BASE_URL) },
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentWhite, unfocusedBorderColor = BorderDefault, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = AccentWhite),
            )
            Button(
                onClick = { gatewaySettings.baseUrl = gatewayUrl; onDismiss() },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted),
                shape = RoundedCornerShape(16.dp),
            ) { Text("SAVE SETTINGS", fontFamily = FontFamily.Monospace, fontSize = 11.sp, letterSpacing = 1.sp) }
            Text("Qloo keys stay on the local gateway. This app stores your library on-device and sends only search/recommendation requests.", color = TextMuted, fontSize = 12.sp)
            if (shelves.isNotEmpty()) {
                Text("SHELF MANAGEMENT", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 1.sp)
                shelves.forEach { shelf ->
                    ShelfManagementRow(shelf = shelf, onUpdate = onUpdateShelf, onDelete = onDeleteShelf)
                }
            }
            Spacer(modifier = Modifier.height(18.dp))
        }
    }

    if (showClearConfirmation) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { showClearConfirmation = false },
            title = { Text("Clear local vault?") },
            text = { Text("This removes shelves, memories, and journal entries from this device.") },
            confirmButton = {
                androidx.compose.material3.TextButton(onClick = {
                    scope.launch { repository.clear(); showClearConfirmation = false; onCleared() }
                }) { Text("CLEAR", color = TextPrimary) }
            },
            dismissButton = { androidx.compose.material3.TextButton(onClick = { showClearConfirmation = false }) { Text("CANCEL", color = TextSecondary) } },
        )
    }
}

@Composable
private fun ShelfManagementRow(shelf: Shelf, onUpdate: (Shelf) -> Unit, onDelete: (Shelf) -> Unit) {
    var name by remember(shelf.id, shelf.title) { mutableStateOf(shelf.title) }
    Row(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.weight(1f), singleLine = true, colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentWhite, unfocusedBorderColor = BorderDefault, focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary, cursorColor = AccentWhite))
        androidx.compose.material3.TextButton(onClick = { onUpdate(shelf.copy(title = name.trim().ifEmpty { shelf.title })) }) { Text("SAVE", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 9.sp) }
        if (shelf.isCustom) androidx.compose.material3.TextButton(onClick = { onDelete(shelf) }) { Text("DEL", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 9.sp) }
    }
}

@Composable
private fun ActionButton(label: String, modifier: Modifier = Modifier, destructive: Boolean = false, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.height(46.dp),
        colors = ButtonDefaults.buttonColors(containerColor = if (destructive) SurfaceCard else AccentWhite, contentColor = if (destructive) TextSecondary else TextInverted),
        shape = RoundedCornerShape(14.dp),
    ) { Text(label, fontFamily = FontFamily.Monospace, fontSize = 10.sp, letterSpacing = 0.8.sp) }
}
