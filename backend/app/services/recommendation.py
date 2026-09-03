from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.order import Order, OrderItem
from app.models.food import Food

def get_smart_recommendations(db: Session, customer_id: Optional[int] = None, limit: int = 6) -> List[Dict[str, Any]]:
    """
    Python-based Smart Recommendation Engine.
    Uses user order history, category frequencies, veg/non-veg affinity,
    and dish keyword similarities to recommend enticing homemade foods.
    """
    if not customer_id:
        # Generic popular and top-rated recommendations
        top_foods = (
            db.query(Food)
            .filter(Food.is_available == True)
            .order_by(Food.is_today_menu.desc(), Food.price.asc())
            .limit(limit)
            .all()
        )
        return [
            {
                "food": food,
                "reason": "Top Trending Homemade Specialties",
            }
            for food in top_foods
        ]

    # 1. Fetch user's completed/placed orders and items
    past_order_items = (
        db.query(OrderItem.food_id, OrderItem.food_name)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.customer_id == customer_id)
        .all()
    )

    ordered_food_ids = {item.food_id for item in past_order_items if item.food_id is not None}
    
    # If customer has never ordered, fall back to top rated / today's specials
    if not ordered_food_ids:
        top_foods = (
            db.query(Food)
            .filter(Food.is_available == True)
            .order_by(Food.is_today_menu.desc(), Food.price.asc())
            .limit(limit)
            .all()
        )
        return [
            {
                "food": food,
                "reason": "Handcrafted Daily Chef Specials",
            }
            for food in top_foods
        ]

    # 2. Analyze ordered foods
    ordered_foods = db.query(Food).filter(Food.id.in_(ordered_food_ids)).all()
    category_counts: Dict[str, int] = {}
    type_counts: Dict[str, int] = {}
    keywords = set()

    for food in ordered_foods:
        category_counts[food.category] = category_counts.get(food.category, 0) + 1
        type_counts[food.food_type] = type_counts.get(food.food_type, 0) + 1
        words = [w.lower() for w in food.name.split() if len(w) > 3]
        keywords.update(words)

    favorite_category = max(category_counts, key=category_counts.get) if category_counts else None
    preferred_type = max(type_counts, key=type_counts.get) if type_counts else "VEG"

    # 3. Score available candidate foods (excluding already ordered, or including if few candidates)
    all_candidates = db.query(Food).filter(Food.is_available == True).all()
    scored_items = []

    for candidate in all_candidates:
        score = 0.0
        reasons = []

        # Category match
        if candidate.category in category_counts:
            score += category_counts[candidate.category] * 4.0
            reasons.append(f"You enjoy {candidate.category}")

        # Dietary match
        if candidate.food_type == preferred_type:
            score += 2.0

        # Keyword match (e.g. Biryani, Curry, Dosa, Chicken, Paneer)
        name_words = [w.lower() for w in candidate.name.split()]
        matched_keywords = keywords.intersection(name_words)
        if matched_keywords:
            score += len(matched_keywords) * 3.5
            reasons.append(f"Matches your taste for {' & '.join([k.capitalize() for k in list(matched_keywords)[:2]])}")

        # Today's menu bonus
        if candidate.is_today_menu:
            score += 1.5

        # Discount / Evening offer bonus
        if candidate.is_evening_offer:
            score += 2.0

        if not reasons:
            reasons.append("Popular dish you might love")

        scored_items.append({
            "food": candidate,
            "score": score,
            "reason": reasons[0] if reasons else "Recommended for you",
        })

    # Sort descending by score
    scored_items.sort(key=lambda x: x["score"], reverse=True)
    top_recommendations = scored_items[:limit]

    return [
        {
            "food": item["food"],
            "reason": item["reason"],
        }
        for item in top_recommendations
    ]
