package com.example.tastemem.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.tastemem.data.LocalTasteMemRepository
import com.example.tastemem.data.TasteMemRepository
import com.example.tastemem.data.remote.TasteMemApi
import com.example.tastemem.theme.AccentWhite
import com.example.tastemem.theme.CanvasBlack
import com.example.tastemem.theme.SurfaceCard
import com.example.tastemem.theme.TextInverted
import com.example.tastemem.theme.TextMuted
import com.example.tastemem.theme.TextPrimary
import com.example.tastemem.theme.TextSecondary
import com.example.tastemem.ui.components.CreateShelfSheet
import com.example.tastemem.ui.components.JellyShelfBlock
import com.example.tastemem.ui.components.SettingsSheet
import com.example.tastemem.ui.components.SmartAddSheet
import com.example.tastemem.ui.recommendations.TasteCompassScreen
import com.example.tastemem.ui.shelf.ShelfDetailScreen

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit = {},
    repository: TasteMemRepository? = null,
    api: TasteMemApi? = null,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val resolvedRepository = repository ?: remember(context) { LocalTasteMemRepository(context.applicationContext) }
    val viewModel: MainScreenViewModel = viewModel(factory = remember(resolvedRepository, api) { MainScreenViewModelFactory(resolvedRepository, api) })
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when {
        uiState.showCompass -> {
            TasteCompassScreen(
                shelves = uiState.shelves,
                results = uiState.recommendations,
                isLoading = uiState.isLoadingRecommendations,
                error = uiState.recommendationError,
                onBack = viewModel::dismissCompass,
                onRequest = { mode, shelfId, location -> viewModel.loadRecommendations(mode, shelfId, location = location) },
                onPin = viewModel::pinRecommendation,
            )
        }
        uiState.showSettings -> {
            if (uiState.activeShelf != null) ShelfDetailScreen(shelf = uiState.activeShelf!!, onBack = viewModel::dismissShelfDetail, onAdd = viewModel::openSmartAdd, onUpdateItem = viewModel::updateItem, onDeleteItem = viewModel::deleteItem) else HomeCanvas(uiState, viewModel, modifier)
            SettingsSheet(repository = resolvedRepository, shelves = uiState.shelves, onUpdateShelf = viewModel::updateShelf, onDeleteShelf = viewModel::deleteShelf, onDismiss = viewModel::dismissSettings, onCleared = viewModel::dismissSettings)
        }
        uiState.showSmartAdd -> {
            if (uiState.activeShelf != null) ShelfDetailScreen(shelf = uiState.activeShelf!!, onBack = viewModel::dismissShelfDetail, onAdd = {}, onUpdateItem = viewModel::updateItem, onDeleteItem = viewModel::deleteItem) else HomeCanvas(uiState, viewModel, modifier)
            SmartAddSheet(
                onDismiss = viewModel::dismissSmartAdd,
                onAddItem = viewModel::addItemToShelf,
                shelfId = uiState.activeShelf?.id,
                shelves = uiState.shelves,
                query = uiState.searchQuery,
                results = uiState.searchResults,
                isSearching = uiState.isSearching,
                error = uiState.searchError,
                onQueryChange = viewModel::search,
            )
        }
        uiState.showCreateShelf -> {
            HomeCanvas(uiState, viewModel, modifier)
            CreateShelfSheet(onDismiss = viewModel::dismissCreateShelf, onCreate = viewModel::addShelf)
        }
        uiState.activeShelf != null -> {
            ShelfDetailScreen(shelf = uiState.activeShelf!!, onBack = viewModel::dismissShelfDetail, onAdd = viewModel::openSmartAdd, onUpdateItem = viewModel::updateItem, onDeleteItem = viewModel::deleteItem)
        }
        else -> {
            HomeCanvas(uiState, viewModel, modifier)
        }
    }
}

@Composable
private fun HomeCanvas(state: TasteMemUiState, viewModel: MainScreenViewModel, modifier: Modifier) {
    Box(modifier = modifier.fillMaxSize().background(CanvasBlack)) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp, vertical = 14.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("TASTEMEM", color = TextPrimary, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, fontSize = 20.sp, letterSpacing = 2.sp)
                    Text("PRIVATE CULTURAL VAULT", color = TextMuted, fontFamily = FontFamily.Monospace, fontSize = 9.sp, letterSpacing = 1.sp)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("${state.shelves.size} SHELVES", color = TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
                    Button(onClick = viewModel::openSettings, modifier = Modifier.size(42.dp), contentPadding = PaddingValues(0.dp), colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard, contentColor = TextPrimary), shape = RoundedCornerShape(14.dp)) { Text("•••", fontSize = 14.sp) }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
            if (state.shelves.isEmpty()) {
                EmptyCanvas(onCreateShelf = viewModel::openCreateShelf, onAdd = viewModel::openSmartAdd)
            } else {
                LazyVerticalGrid(columns = GridCells.Fixed(2), modifier = Modifier.weight(1f), contentPadding = PaddingValues(bottom = 110.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    items(state.shelves.filterNot { it.isHidden }, key = { it.id }) { shelf -> JellyShelfBlock(shelf = shelf, onClick = { viewModel.selectShelf(shelf) }, onPositionChanged = viewModel::updateShelf, modifier = Modifier.fillMaxWidth()) }
                }
            }
        }
        Row(modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 18.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = viewModel::openSmartAdd, modifier = Modifier.height(52.dp), colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted), shape = RoundedCornerShape(18.dp)) { Text("+ ADD MEMORY", fontFamily = FontFamily.Monospace, fontSize = 11.sp, letterSpacing = 0.8.sp) }
            Button(onClick = { viewModel.openCompass() }, modifier = Modifier.height(52.dp), colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard, contentColor = TextPrimary), shape = RoundedCornerShape(18.dp)) { Text("◎ COMPASS", fontFamily = FontFamily.Monospace, fontSize = 11.sp, letterSpacing = 0.8.sp) }
        }
    }
}

@Composable
private fun EmptyCanvas(onCreateShelf: () -> Unit, onAdd: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("YOUR TASTE, IN ONE PLACE", color = TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(10.dp))
        Text("Create a shelf for what you watch, read, hear, and visit.", color = TextSecondary, fontSize = 13.sp)
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onCreateShelf, modifier = Modifier.fillMaxWidth(0.78f).height(52.dp), colors = ButtonDefaults.buttonColors(containerColor = AccentWhite, contentColor = TextInverted), shape = RoundedCornerShape(18.dp)) { Text("CREATE YOUR FIRST SHELF", fontFamily = FontFamily.Monospace, fontSize = 11.sp, letterSpacing = 0.7.sp) }
        Spacer(modifier = Modifier.height(10.dp))
        Button(onClick = onAdd, modifier = Modifier.fillMaxWidth(0.78f).height(48.dp), colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard, contentColor = TextPrimary), shape = RoundedCornerShape(18.dp)) { Text("SEARCH A MEMORY", fontFamily = FontFamily.Monospace, fontSize = 11.sp, letterSpacing = 0.7.sp) }
    }
}

private class MainScreenViewModelFactory(private val repository: TasteMemRepository, private val api: TasteMemApi?) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T = MainScreenViewModel(repository, api) as T
}
