package com.example.tastemem

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.tastemem.ui.main.MainScreen
import com.example.tastemem.data.GatewaySettings
import com.example.tastemem.data.LocalTasteMemRepository
import com.example.tastemem.data.remote.HttpTasteMemApi

@Composable
fun MainNavigation() {
  val backStack = rememberNavBackStack(Main)
  val context = LocalContext.current
  val repository = remember(context) { LocalTasteMemRepository(context.applicationContext) }
  val gatewaySettings = remember(context) { GatewaySettings(context.applicationContext) }
  val api = remember(gatewaySettings.baseUrl) { HttpTasteMemApi(gatewaySettings.baseUrl) }

  NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryProvider =
      entryProvider {
        entry<Main> {
          MainScreen(repository = repository, api = api, onItemClick = { navKey -> backStack.add(navKey) }, modifier = Modifier.safeDrawingPadding().padding(16.dp))
        }
      },
  )
}
