"""
Train Machine Learning Recommendation Model for OptiTry Eyewear System.

Pipeline specifications:
1. Loads customer feedback dataset linking customer preferences to catalogue frames.
2. Validates data integrity, label distribution, and absence of face-shape classification.
3. Groups by customer_id to strictly eliminate customer interaction leakage between train and test.
4. Trains Logistic Regression baseline on genuine preference-frame interaction pairs.
5. Evaluates model comprehensively (ROC-AUC, Precision, Recall, Accuracy, F1, Brier Score).
6. Exports model weights, intercept, feature metadata, and evaluation metrics to JSON
   for seamless, zero-latency inference directly in the React frontend.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    brier_score_loss,
    confusion_matrix
)

# -----------------------------------------------------------------------------
# DOMAIN KNOWLEDGE CONFIGURATION (Matched exactly in TypeScript inference)
# -----------------------------------------------------------------------------

COLOR_AFFINITY = {
    'Black': ['Black', 'Gunmetal'],
    'Brown': ['Brown', 'Tortoise', 'Amber'],
    'Gold': ['Gold', 'Rose Gold', 'Copper', 'Champagne'],
    'Silver': ['Silver', 'Gunmetal'],
    'Transparent': ['Clear', 'Champagne', 'Transparent'],
    'Burgundy': ['Burgundy'],
    'Teal': ['Teal', 'Blue'],
    'Rose Gold': ['Rose Gold', 'Gold'],
    'No Preference': []
}

STYLE_AFFINITY = {
    'Classic': {'Classic': 1.0, 'Professional': 0.70, 'Casual': 0.50, 'Modern': 0.35, 'Trendy': 0.20},
    'Modern': {'Modern': 1.0, 'Professional': 0.70, 'Trendy': 0.65, 'Casual': 0.50, 'Classic': 0.30},
    'Trendy': {'Trendy': 1.0, 'Modern': 0.75, 'Casual': 0.60, 'Classic': 0.30, 'Professional': 0.25},
    'Professional': {'Professional': 1.0, 'Classic': 0.75, 'Modern': 0.65, 'Casual': 0.40, 'Trendy': 0.25},
    'Casual': {'Casual': 1.0, 'Modern': 0.70, 'Trendy': 0.65, 'Classic': 0.50, 'Professional': 0.35}
}

STYLES_LIST = ['Classic', 'Modern', 'Trendy', 'Professional', 'Casual']

FEATURE_NAMES = [
    'style_exact_match',
    'style_affinity_score',
    'color_match',
    'budget_within',
    'price_to_budget_ratio',
    'price_normalized',
    'pref_is_Classic',
    'pref_is_Modern',
    'pref_is_Trendy',
    'pref_is_Professional',
    'pref_is_Casual',
    'style_match_x_budget',
    'color_match_x_budget',
    'full_preference_match'
]

BUDGET_CEILING_MAP = {
    '₹1,000 - ₹1,200': 1200,
    '₹1,201 - ₹1,500': 1500,
    '₹1,501 - ₹1,800': 1800,
    '₹1,801 - ₹2,000': 2000,
    'Any Budget': 2000
}


def extract_features_single(pref_style, pref_color, budget_max, frame_style, frame_color, frame_price):
    """
    Extract deterministic feature vector for a customer-preference and frame pair.
    Must be kept strictly synchronized with TypeScript extractFeatures().
    """
    pref_style_clean = str(pref_style).strip() if pd.notna(pref_style) else 'Classic'
    pref_color_clean = str(pref_color).strip() if pd.notna(pref_color) else 'No Preference'
    frame_style_clean = str(frame_style).strip() if pd.notna(frame_style) else ''
    frame_color_clean = str(frame_color).strip() if pd.notna(frame_color) else ''
    frame_price_val = float(frame_price) if pd.notna(frame_price) else 1500.0
    budget_val = float(budget_max) if pd.notna(budget_max) and float(budget_max) > 0 else 2000.0

    # 1. Style exact match
    style_exact = 1.0 if frame_style_clean.lower() == pref_style_clean.lower() else 0.0

    # 2. Style affinity score
    style_affinity = STYLE_AFFINITY.get(pref_style_clean, {}).get(frame_style_clean, 0.40)

    # 3. Color match
    if pref_color_clean.lower() in ['no preference', '', 'none', 'any']:
        color_match = 1.0
    else:
        allowed_colors = COLOR_AFFINITY.get(pref_color_clean, [pref_color_clean])
        allowed_colors_lower = [c.lower() for c in allowed_colors]
        color_match = 1.0 if frame_color_clean.lower() in allowed_colors_lower else 0.0

    # 4. Budget within
    budget_within = 1.0 if frame_price_val <= budget_val else 0.0

    # 5. Price to budget ratio (clamped between 0.4 and 2.0)
    price_to_budget_ratio = min(2.0, max(0.4, frame_price_val / budget_val))

    # 6. Price normalized (scaled between 1000 and 2000)
    price_normalized = min(1.0, max(0.0, (frame_price_val - 1000.0) / 1000.0))

    # 7-11. Customer preference style indicators
    pref_classic = 1.0 if pref_style_clean == 'Classic' else 0.0
    pref_modern = 1.0 if pref_style_clean == 'Modern' else 0.0
    pref_trendy = 1.0 if pref_style_clean == 'Trendy' else 0.0
    pref_professional = 1.0 if pref_style_clean == 'Professional' else 0.0
    pref_casual = 1.0 if pref_style_clean == 'Casual' else 0.0

    # 12-14. Multi-attribute interaction terms
    style_match_x_budget = style_exact * budget_within
    color_match_x_budget = color_match * budget_within
    full_preference_match = style_exact * color_match * budget_within

    return [
        style_exact,
        style_affinity,
        color_match,
        budget_within,
        price_to_budget_ratio,
        price_normalized,
        pref_classic,
        pref_modern,
        pref_trendy,
        pref_professional,
        pref_casual,
        style_match_x_budget,
        color_match_x_budget,
        full_preference_match
    ]


def load_and_validate_dataset(csv_path):
    """Loads CSV and strictly checks required fields and absence of forbidden face-shape fields."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Customer interaction dataset not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    required_columns = [
        'customer_id',
        'pref_style',
        'pref_color',
        'budget_max',
        'frame_id',
        'frame_style',
        'frame_color',
        'frame_price',
        'feedback_label'
    ]

    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")

    # Explicit safety check: Ensure NO face-shape features are in the dataset or pipeline
    forbidden_terms = ['face_shape', 'faceshape', 'face_type', 'oval_score', 'round_score', 'jaw_ratio']
    found_forbidden = [col for col in df.columns if any(term in col.lower() for term in forbidden_terms)]
    if found_forbidden:
        raise ValueError(f"Forbidden face-shape features detected in recommendation data: {found_forbidden}")

    # Remove invalid records
    df = df.dropna(subset=['customer_id', 'feedback_label', 'frame_id'])
    df['feedback_label'] = df['feedback_label'].astype(int)

    # Validate binary label
    if not set(df['feedback_label'].unique()).issubset({0, 1}):
        raise ValueError(f"Invalid labels found in feedback_label: {df['feedback_label'].unique()}")

    return df


def train_and_evaluate(dataset_path=None, export_path=None, random_seed=42):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if dataset_path is None:
        dataset_path = os.path.join(base_dir, 'data', 'customer_interactions.csv')
    if export_path is None:
        export_path = os.path.join(base_dir, '..', 'src', 'recommendation', 'model_weights.json')

    print("================================================================")
    print("   OptiTry Recommendation Engine — ML Model Training Pipeline   ")
    print("================================================================")
    print(f"Loading dataset from: {dataset_path}")

    df = load_and_validate_dataset(dataset_path)
    total_samples = len(df)
    unique_customers = df['customer_id'].nunique()
    pos_samples = int((df['feedback_label'] == 1).sum())
    neg_samples = int((df['feedback_label'] == 0).sum())

    print(f"Total samples: {total_samples}")
    print(f"Unique customers: {unique_customers}")
    print(f"Positive feedback: {pos_samples} ({pos_samples / total_samples * 100:.1f}%)")
    print(f"Negative feedback: {neg_samples} ({neg_samples / total_samples * 100:.1f}%)")

    if total_samples < 50:
        raise ValueError("Insufficient dataset size for reliable training and evaluation.")

    # Extract feature matrix X
    feature_rows = []
    for _, row in df.iterrows():
        vec = extract_features_single(
            row['pref_style'],
            row['pref_color'],
            row['budget_max'],
            row['frame_style'],
            row['frame_color'],
            row['frame_price']
        )
        feature_rows.append(vec)

    X = np.array(feature_rows, dtype=np.float64)
    y = df['feedback_label'].values.astype(int)
    groups = df['customer_id'].values

    # Group-based split to guarantee no customer interaction leakage between train & test
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=random_seed)
    train_idx, test_idx = next(gss.split(X, y, groups=groups))

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    train_cust_count = len(np.unique(groups[train_idx]))
    test_cust_count = len(np.unique(groups[test_idx]))

    print(f"\nGroup-Aware Train/Test Split (Strictly Zero Customer Leakage):")
    print(f"  Train: {len(X_train)} interactions ({train_cust_count} distinct customers)")
    print(f"  Test:  {len(X_test)} interactions ({test_cust_count} distinct customers)")

    # Train Logistic Regression model
    clf = LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver='lbfgs',
        random_state=random_seed
    )
    clf.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    brier = float(brier_score_loss(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\nHeld-Out Evaluation Metrics:")
    print(f"  ROC-AUC:        {roc_auc:.4f}")
    print(f"  Accuracy:       {acc:.4f} ({acc * 100:.1f}%)")
    print(f"  Precision:      {prec:.4f}")
    print(f"  Recall:         {rec:.4f}")
    print(f"  F1 Score:       {f1:.4f}")
    print(f"  Brier Loss:     {brier:.4f}")
    print(f"  Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

    # Inspect Learned Weights
    print("\nLearned Feature Coefficients:")
    coefs = clf.coef_[0].tolist()
    intercept = float(clf.intercept_[0])
    for name, w in zip(FEATURE_NAMES, coefs):
        print(f"  {name:25s}: {w:+.4f}")
    print(f"  {'intercept':25s}: {intercept:+.4f}")

    # Export model to JSON for frontend inference
    model_payload = {
        'version': '1.0.0',
        'algorithm': 'LogisticRegression',
        'trained_at': pd.Timestamp.now().isoformat(),
        'random_seed': random_seed,
        'feature_names': FEATURE_NAMES,
        'coefficients': coefs,
        'intercept': intercept,
        'metrics': {
            'train_samples': int(len(X_train)),
            'test_samples': int(len(X_test)),
            'train_customers': train_cust_count,
            'test_customers': test_cust_count,
            'roc_auc': round(roc_auc, 4),
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1': round(f1, 4),
            'brier_score': round(brier, 4),
            'confusion_matrix': cm
        },
        'feature_meta': {
            'color_affinity': COLOR_AFFINITY,
            'style_affinity': STYLE_AFFINITY,
            'styles_list': STYLES_LIST,
            'budget_ceiling_map': BUDGET_CEILING_MAP,
            'price_min': 1000,
            'price_max': 2000
        }
    }

    os.makedirs(os.path.dirname(os.path.abspath(export_path)), exist_ok=True)
    with open(export_path, 'w', encoding='utf-8') as f:
        json.dump(model_payload, f, indent=2)

    print(f"\nModel exported successfully to: {export_path}")
    return model_payload


if __name__ == '__main__':
    train_and_evaluate()
