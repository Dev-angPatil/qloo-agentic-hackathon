"""
BrandSoul - Automated Integration & Engine Tests
Verifies analytics parsing, brand tiering, pitch generation, and FastAPI endpoints.
"""

import unittest
from unittest.mock import AsyncMock, patch
from src.analytics_parser import (
    CreatorProfile,
    map_age_bracket_to_qloo,
    parse_clipboard_analytics,
    VERIFIED_PRESETS,
)
from src.brand_engine import (
    BrandDossier,
    classify_brand_tier,
    compile_brand_dossiers,
    process_brand_entity,
)
from src.pitch_agent import (
    generate_ab_benchmark,
    generate_outreach_pitch,
    generate_synergy_story,
)


class TestAnalyticsParser(unittest.TestCase):
    """Test suite for analytics parsing and normalization."""

    def test_age_bracket_mapping(self):
        self.assertEqual(map_age_bracket_to_qloo("18_to_24"), ["24_and_younger"])
        self.assertEqual(map_age_bracket_to_qloo("25_to_34"), ["25_to_29", "30_to_34"])
        self.assertEqual(map_age_bracket_to_qloo("35_to_44"), ["35_to_44"])
        self.assertEqual(map_age_bracket_to_qloo("unknown_bracket"), ["25_to_29", "30_to_34"])

    def test_presets_exist_and_valid(self):
        self.assertIn("tech_engineering", VERIFIED_PRESETS)
        self.assertIn("aesthetic_lifestyle", VERIFIED_PRESETS)
        preset = VERIFIED_PRESETS["tech_engineering"]
        self.assertTrue(len(preset["co_watched_creators"]) >= 2)

    def test_parse_clipboard_analytics(self):
        sample_clipboard = """
        Channels your audience watches:
        • Marques Brownlee
        • Veritasium
        • Lex Fridman
        Age: 25–34 (52%)
        Gender: Male 72%, Female 28%
        """
        profile = parse_clipboard_analytics(sample_clipboard)
        self.assertIn("Marques Brownlee", profile.co_watched_creators)
        self.assertEqual(profile.age_bracket, "25_to_34")
        self.assertEqual(profile.gender_ratio, "male")


class TestBrandEngine(unittest.TestCase):
    """Test suite for brand classification, scoring, and tiering."""

    def test_classify_brand_tier(self):
        tier, label = classify_brand_tier("Google", [])
        self.assertEqual(tier, "anchor")

        boutique_tags = [{"type": "urn:tag:retail_channel:qloo", "name": "Direct-to-Consumer"}]
        tier_b, _ = classify_brand_tier("Bellroy", boutique_tags)
        self.assertEqual(tier_b, "boutique")

    def test_process_brand_entity(self):
        raw = {
            "entity_id": "TEST-1234",
            "name": "OnePlus",
            "query": {"affinity": 0.957},
            "tags": [
                {"type": "urn:tag:personal_style:qloo", "name": "Functional Minimalist"},
                {"type": "urn:tag:product_category:qloo", "name": "Electronics"},
                {"type": "urn:tag:sustainability_initiative:qloo", "name": "Recycled Aluminum"},
            ],
            "external": {
                "twitter": [{"id": "oneplus"}],
            },
        }
        dossier = process_brand_entity(raw)
        self.assertEqual(dossier.name, "OnePlus")
        self.assertEqual(dossier.affinity_pct, 95.7)
        self.assertIn("Functional Minimalist", dossier.personal_styles)
        self.assertEqual(dossier.social_handles.get("twitter"), "@oneplus")


class TestPitchAgent(unittest.TestCase):
    """Test suite for pitch drafting and benchmark synthesis."""

    def setUp(self):
        self.profile = CreatorProfile(
            creator_name="Circuit & Reason",
            platform="youtube",
            niche="Hardware Systems",
            co_watched_creators=["MKBHD", "Veritasium"],
            age_bracket="25_to_34",
        )
        self.brand = BrandDossier(
            entity_id="B-123",
            name="OnePlus",
            affinity_score=0.957,
            affinity_pct=95.7,
            tier="boutique",
            tier_label="Indie / Boutique Gem",
            primary_category="Hardware",
            personal_styles=["Functional Minimalist"],
            sustainability_badges=["Recycled Materials"],
            social_handles={"twitter": "@oneplus"},
        )

    def test_synergy_story(self):
        story = generate_synergy_story(self.profile, self.brand)
        self.assertIn("OnePlus", story)
        self.assertIn("95.7%", story)

    def test_outreach_pitch(self):
        pitch = generate_outreach_pitch(self.profile, self.brand)
        self.assertIn("Circuit & Reason", pitch["subject"])
        self.assertIn("OnePlus", pitch["subject"])
        self.assertIn("95.7%", pitch["body"])
        self.assertIn("Partnerships Team", pitch["body"])

    def test_ab_benchmark(self):
        benchmark = generate_ab_benchmark(self.profile, [self.brand])
        self.assertIn("generic_llm", benchmark)
        self.assertIn("qloo_grounded", benchmark)
        self.assertEqual(benchmark["generic_llm"]["brands"][0]["name"], "NordVPN")
        self.assertEqual(benchmark["qloo_grounded"]["brands"][0]["name"], "OnePlus")


if __name__ == "__main__":
    unittest.main()
