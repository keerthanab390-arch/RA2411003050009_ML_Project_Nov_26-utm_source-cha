"""
Generate Benchmark Customer Feedback Dataset for OptiTry Recommendation Engine.

This script produces a realistic, validated customer interaction dataset linking
customer preferences at interaction time with frames from FRAMES_CATALOGUE and
explicit feedback labels (1 = positive feedback like/favourite/cart/purchase,
0 = negative feedback dislike/dismissed).

Crucially, unselected frames are NEVER automatically assumed to be disliked.
All records represent explicit interaction feedback events.
Pseudonymous customer IDs are assigned to allow group-based, leak-free train/test splitting.
No personal data, images, or facial landmarks are stored.
"""

import json
import random
import csv
import os
from datetime import datetime, timedelta

def generate_benchmark_dataset():
    random.seed(42)

    catalogue_path = os.path.join(os.path.dirname(__file__), 'data', 'catalogue_reference.json')
    with open(catalogue_path, 'r', encoding='utf-8') as f:
        catalogue = json.load(f)

    styles = ['Classic', 'Modern', 'Trendy', 'Professional', 'Casual']
    colors = ['Black', 'Brown', 'Gold', 'Silver', 'Transparent', 'No Preference', 'Burgundy', 'Teal', 'Rose Gold']
    budget_tiers = [
        ('₹1,000 - ₹1,200', 1200),
        ('₹1,201 - ₹1,500', 1500),
        ('₹1,501 - ₹1,800', 1800),
        ('₹1,801 - ₹2,000', 2000),
        ('Any Budget', 2000)
    ]

    # Related colors mapping for realistic customer affinity
    color_affinity = {
        'Black': ['Black', 'Gunmetal'],
        'Brown': ['Brown', 'Tortoise', 'Amber'],
        'Gold': ['Gold', 'Rose Gold', 'Copper', 'Champagne'],
        'Silver': ['Silver', 'Gunmetal'],
        'Transparent': ['Clear', 'Champagne'],
        'Burgundy': ['Burgundy'],
        'Teal': ['Teal', 'Blue'],
        'Rose Gold': ['Rose Gold', 'Gold'],
        'No Preference': [c['color'] for c in catalogue]
    }

    # Style affinity mapping
    style_affinity = {
        'Classic': {'Classic': 0.85, 'Professional': 0.70, 'Casual': 0.50, 'Modern': 0.35, 'Trendy': 0.20},
        'Modern': {'Modern': 0.85, 'Professional': 0.70, 'Trendy': 0.65, 'Casual': 0.50, 'Classic': 0.30},
        'Trendy': {'Trendy': 0.85, 'Modern': 0.75, 'Casual': 0.60, 'Classic': 0.30, 'Professional': 0.25},
        'Professional': {'Professional': 0.85, 'Classic': 0.75, 'Modern': 0.65, 'Casual': 0.40, 'Trendy': 0.25},
        'Casual': {'Casual': 0.85, 'Modern': 0.70, 'Trendy': 0.65, 'Classic': 0.50, 'Professional': 0.35}
    }

    base_time = datetime(2026, 9, 1, 10, 0, 0)
    records = []

    # Generate interactions for 150 pseudonymous customers
    customer_count = 150
    for cust_idx in range(1, customer_count + 1):
        cust_id = f"cust_{cust_idx:04d}"
        session_id = f"sess_{cust_idx:04d}_1"

        # Customer's preferences during this kiosk session
        pref_style = random.choice(styles)
        pref_color = random.choice(colors)
        pref_budget_label, budget_max = random.choice(budget_tiers)

        # Number of frames this customer explicitly evaluated/interacted with (3 to 6 frames)
        num_evaluations = random.randint(3, 6)
        evaluated_frames = random.sample(catalogue, num_evaluations)

        for frame in evaluated_frames:
            # Check attribute affinities
            style_score = style_affinity[pref_style].get(frame['style'], 0.4)
            is_color_match = (
                pref_color == 'No Preference' or
                frame['color'] in color_affinity.get(pref_color, [pref_color])
            )
            color_score = 0.85 if is_color_match else 0.25

            # Budget fit
            is_within_budget = frame['price'] <= budget_max
            budget_score = 0.9 if is_within_budget else 0.1

            # Base probability of positive feedback
            # Influenced by style, color, budget fit, and human variance
            prob_positive = (
                0.40 * style_score +
                0.35 * color_score +
                0.25 * budget_score
            )
            # Add subtle natural noise (-0.08 to +0.08)
            prob_positive += random.uniform(-0.08, 0.08)
            prob_positive = max(0.05, min(0.95, prob_positive))

            is_positive = random.random() < prob_positive

            if is_positive:
                feedback_type = random.choice(['favourite', 'add_to_cart', 'purchase', 'explicit_like'])
                feedback_label = 1
            else:
                feedback_type = random.choice(['explicit_dislike', 'dismiss'])
                feedback_label = 0

            interaction_time = base_time + timedelta(
                days=random.randint(0, 45),
                hours=random.randint(0, 10),
                minutes=random.randint(0, 59)
            )

            records.append({
                'customer_id': cust_id,
                'session_id': session_id,
                'timestamp': interaction_time.isoformat(),
                'pref_style': pref_style,
                'pref_color': pref_color,
                'pref_budget': pref_budget_label,
                'budget_max': budget_max,
                'frame_id': frame['id'],
                'frame_name': frame['name'],
                'frame_style': frame['style'],
                'frame_color': frame['color'],
                'frame_shape': frame['shape'],
                'frame_size': frame['size'],
                'frame_price': frame['price'],
                'feedback_type': feedback_type,
                'feedback_label': feedback_label
            })

    output_csv = os.path.join(os.path.dirname(__file__), 'data', 'customer_interactions.csv')
    fieldnames = list(records[0].keys())

    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    positive_count = sum(1 for r in records if r['feedback_label'] == 1)
    negative_count = sum(1 for r in records if r['feedback_label'] == 0)

    print(f"Dataset generated successfully at: {output_csv}")
    print(f"Total interactions: {len(records)}")
    print(f"Unique customers: {customer_count}")
    print(f"Positive feedback (1): {positive_count} ({positive_count/len(records)*100:.1f}%)")
    print(f"Negative feedback (0): {negative_count} ({negative_count/len(records)*100:.1f}%)")
    print(f"Frames covered: {len(set(r['frame_id'] for r in records))} of {len(catalogue)}")

if __name__ == '__main__':
    generate_benchmark_dataset()
