package com.example.tastemem.ui.main

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import org.junit.Before
import org.junit.Rule
import org.junit.Test

/** UI tests for [com.example.tastemem.ui.main.MainScreen]. */
class MainScreenTest {

  @get:Rule val composeTestRule = createAndroidComposeRule<ComponentActivity>()

  @Before
  fun setup() {
    composeTestRule.setContent { MainScreen() }
  }

  @Test
  fun empty_vault_shows_first_shelf_actions() {
    composeTestRule.onNodeWithText("TASTEMEM").assertExists()
    composeTestRule.onNodeWithText("CREATE YOUR FIRST SHELF").assertExists()
    composeTestRule.onNodeWithText("SEARCH A MEMORY").assertExists()
  }
}
