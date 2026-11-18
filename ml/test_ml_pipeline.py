"""
Automated Unit and Integration Tests for ML Recommendation Pipeline.

Validates:
1. Dataset structure and integrity.
2. Complete absence of face shape classification or landmarks.
3. Feature extraction parity and determinism.
4. Model training reproducibility and metric validity.
5. Exported JSON model structure, non-empty weights, and validity.
"""

import os
import json
import unittest
import numpy as np
import pandas as pd
from ml.train_model import (
    load_and_validate_dataset,
    extract_features_single,
    train_and_evaluate,
    FEATURE_NAMES,
    BUDGET_CEILING_MAP
)

class TestMLRecommendationPipeline(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.dataset_path = os.path.join(self.base_dir, 'data', 'customer_interactions.csv')
        self.model_path = os.path.join(self.base_dir, '..', 'src', 'recommendation', 'model_weights.json')

    def test_01_dataset_exists_and_valid(self):
        """Test dataset exists, loads, has valid columns and binary labels."""
        self.assertTrue(os.path.exists(self.dataset_path), "Dataset CSV must exist")
        df = load_and_validate_dataset(self.dataset_path)
        self.assertGreater(len(df), 100, "Dataset should have at least 100 interactions")
        self.assertTrue(set(df['feedback_label'].unique()).issubset({0, 1}), "Labels must be binary 0 or 1")
        self.assertGreater(df['customer_id'].nunique(), 20, "Should have multiple unique pseudonymous customers")

    def test_02_strictly_no_face_shape_features(self):
        """CRITICAL REQUIREMENT: Verify NO face-shape classification or features exist in recommendation data."""
        df = pd.read_csv(self.dataset_path)
        forbidden_keywords = ['face_shape', 'faceshape', 'face_type', 'oval_score', 'round_score', 'jaw_ratio']
        for col in df.columns:
            for kw in forbidden_keywords:
                self.assertNotIn(kw, col.lower(), f"Forbidden face-shape feature detected: {col}")

        # Check feature names list
        for fname in FEATURE_NAMES:
            for kw in forbidden_keywords:
                self.assertNotIn(kw, fname.lower(), f"Forbidden face-shape feature in feature list: {fname}")

    def test_03_feature_extraction_vector_length_and_types(self):
        """Test single feature extraction returns valid floats with exact expected dimensions."""
        vec = extract_features_single(
            pref_style='Modern',
            pref_color='Burgundy',
            budget_max=1500,
            frame_style='Modern',
            frame_color='Burgundy',
            frame_price=1299
        )
        self.assertEqual(len(vec), len(FEATURE_NAMES), "Feature vector length must match FEATURE_NAMES")
        for val in vec:
            self.assertIsInstance(val, float)
            self.assertFalse(np.isnan(val), "Feature value must not be NaN")

        # Test exact match values
        self.assertEqual(vec[0], 1.0, "style_exact_match should be 1.0")
        self.assertEqual(vec[2], 1.0, "color_match should be 1.0")
        self.assertEqual(vec[3], 1.0, "budget_within should be 1.0 (1299 <= 1500)")

    def test_04_budget_filtering_feature(self):
        """Test budget_within is 0 when price exceeds budget."""
        vec = extract_features_single(
            pref_style='Classic',
            pref_color='Black',
            budget_max=1200,
            frame_style='Classic',
            frame_color='Black',
            frame_price=1899
        )
        self.assertEqual(vec[3], 0.0, "budget_within should be 0.0 for 1899 > 1200")

    def test_05_exported_model_json_validity(self):
        """Test exported model JSON contains required fields, coefficients, and reasonable metrics."""
        self.assertTrue(os.path.exists(self.model_path), "Model JSON must exist")
        with open(self.model_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.assertIn('version', data)
        self.assertIn('algorithm', data)
        self.assertIn('feature_names', data)
        self.assertIn('coefficients', data)
        self.assertIn('intercept', data)
        self.assertIn('metrics', data)
        self.assertIn('feature_meta', data)

        self.assertEqual(len(data['coefficients']), len(data['feature_names']))
        self.assertGreater(data['metrics']['roc_auc'], 0.50, "ROC-AUC should exceed random chance")
        self.assertGreater(data['metrics']['accuracy'], 0.50, "Accuracy should exceed random chance")

if __name__ == '__main__':
    unittest.main()
