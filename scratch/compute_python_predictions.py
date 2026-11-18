import sys
import json
import numpy as np
sys.path.insert(0, '.')
from ml.train_model import extract_features_single

with open('src/recommendation/model_weights.json', 'r', encoding='utf-8') as f:
    model = json.load(f)

coefs = np.array(model['coefficients'])
intercept = model['intercept']

def predict(pref_style, pref_color, budget_max, frame_style, frame_color, frame_price):
    vec = np.array(extract_features_single(pref_style, pref_color, budget_max, frame_style, frame_color, frame_price))
    logit = np.dot(vec, coefs) + intercept
    prob = 1.0 / (1.0 + np.exp(-logit))
    return float(prob), vec.tolist()

test_cases = [
    {
        'name': 'Case 1: Full match within budget',
        'pref_style': 'Modern',
        'pref_color': 'Burgundy',
        'budget_max': 1500,
        'frame_style': 'Modern',
        'frame_color': 'Burgundy',
        'frame_price': 1299
    },
    {
        'name': 'Case 2: Style match, color mismatch',
        'pref_style': 'Classic',
        'pref_color': 'Black',
        'budget_max': 2000,
        'frame_style': 'Classic',
        'frame_color': 'Rose Gold',
        'frame_price': 1799
    },
    {
        'name': 'Case 3: No preference color, over budget',
        'pref_style': 'Professional',
        'pref_color': 'No Preference',
        'budget_max': 1200,
        'frame_style': 'Professional',
        'frame_color': 'Gunmetal',
        'frame_price': 1599
    },
    {
        'name': 'Case 4: Casual style with Teal',
        'pref_style': 'Casual',
        'pref_color': 'Teal',
        'budget_max': 1800,
        'frame_style': 'Casual',
        'frame_color': 'Teal',
        'frame_price': 1399
    }
]

results = []
for tc in test_cases:
    prob, vec = predict(
        tc['pref_style'],
        tc['pref_color'],
        tc['budget_max'],
        tc['frame_style'],
        tc['frame_color'],
        tc['frame_price']
    )
    tc_res = dict(tc)
    tc_res['python_probability'] = prob
    tc_res['python_vector'] = vec
    results.append(tc_res)

with open('scratch/parity_ground_truth.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print("Saved scratch/parity_ground_truth.json with Python reference predictions.")
