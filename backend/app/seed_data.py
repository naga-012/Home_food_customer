import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.cook import HomeCook
from app.models.food import Food
from app.models.cart import Cart
from app.models.order import Order, OrderItem
from app.models.review import Review
from app.models.favorite import Favorite
from app.models.subscription import Subscription
from app.models.notification import Notification
from app.utils.security import hash_password

def seed_database():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Home Cooks...")
        cooks_data = [
            {
                "name": "Lakshmi Narayanan",
                "email": "amma@intiruchi.com",
                "phone": "9848011223",
                "kitchen_name": "Amma's Traditional Kitchen",
                "description": "Authentic grandma-style South Indian recipes made with cold-pressed oils, hand-ground masalas, and unconditional motherly love.",
                "specialization": "South Indian & Andhra Meals",
                "city": "Hyderabad",
                "address": "Road No. 12, Banjara Hills",
                "rating": 4.9,
                "total_reviews": 48,
                "approval_status": "APPROVED",
                "banner": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Mohammed Zubair Khan",
                "email": "zaika@intiruchi.com",
                "phone": "9988123456",
                "kitchen_name": "Hyderabadi Shahi Zaika",
                "description": "Slow-cooked Dum Biryanis and Nizami delicacies perfected through three generations of family wedding culinary traditions.",
                "specialization": "Hyderabadi Dum Biryani & Kebabs",
                "city": "Hyderabad",
                "address": "Near Charminar, Old City",
                "rating": 4.8,
                "total_reviews": 62,
                "approval_status": "APPROVED",
                "banner": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Harpreet Kaur",
                "email": "rasoi@intiruchi.com",
                "phone": "9765432100",
                "kitchen_name": "Dadi's Desi Rasoi",
                "description": "Wholesome, ghee-laced Punjabi comfort food. Fluffy parathas, slow-simmered Rajma, and homestyle dal makhani like you're back home.",
                "specialization": "Punjabi & North Indian Thalis",
                "city": "Hyderabad",
                "address": "Kondapur High Street",
                "rating": 4.9,
                "total_reviews": 39,
                "approval_status": "APPROVED",
                "banner": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Sujata Menon",
                "email": "malabar@intiruchi.com",
                "phone": "9811223344",
                "kitchen_name": "Malabar Coast Kitchen",
                "description": "Fragrant coconut-infused coastal curries, lace appams, and Malabar seafood specialties prepared freshly each day.",
                "specialization": "Kerala & Coastal Delights",
                "city": "Hyderabad",
                "address": "Madhapur Cyber Hills",
                "rating": 4.7,
                "total_reviews": 31,
                "approval_status": "APPROVED",
                "banner": "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80",
            },
            {
                "name": "Kavita Reddy",
                "email": "prakriti@intiruchi.com",
                "phone": "9900112233",
                "kitchen_name": "Prakriti Healthy Bowls",
                "description": "Clean, organic, nutritious millet bowls, high-protein sprouts, detox teas, and diabetic-friendly wholesome home meals.",
                "specialization": "Millet Bowls & Nutritious Diets",
                "city": "Hyderabad",
                "address": "Jubilee Hills Check Post",
                "rating": 4.8,
                "total_reviews": 27,
                "approval_status": "APPROVED",
                "banner": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
            },
        ]

        created_cooks = []
        for c in cooks_data:
            user = User(
                name=c["name"],
                email=c["email"],
                phone=c["phone"],
                password_hash=hash_password("cook123"),
                role="HOME_COOK",
                address=c["address"],
                city=c["city"],
                pincode="500081",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            cook = HomeCook(
                user_id=user.id,
                kitchen_name=c["kitchen_name"],
                description=c["description"],
                specialization=c["specialization"],
                approval_status=c["approval_status"],
                rating=c["rating"],
                total_reviews=c["total_reviews"],
                banner_image=c["banner"],
            )
            db.add(cook)
            db.commit()
            db.refresh(cook)
            created_cooks.append(cook)

        print("Seeding 10 Customers...")
        customer_names = [
            ("Ananya Sharma", "ananya@intiruchi.com", "9812345671", "Flat 402, Green View Apts, Hitec City"),
            ("Rahul Verma", "rahul@intiruchi.com", "9812345672", "Villa 14, Rainbow Meadows, Gachibowli"),
            ("Pooja Nair", "pooja@intiruchi.com", "9812345673", "Flat 101, Lake Crest, Madhapur"),
            ("Vikram Rao", "vikram@intiruchi.com", "9812345674", "Plot 45, Prashasan Nagar, Jubilee Hills"),
            ("Sneha Kulkarni", "sneha@intiruchi.com", "9812345675", "Flat 204, Sapphire Heights, Kukatpally"),
            ("Aditya Mishra", "aditya@intiruchi.com", "9812345676", "House 12, Telecom Nagar, Gachibowli"),
            ("Divya Patel", "divya@intiruchi.com", "9812345677", "Flat 303, Lotus Arcade, Kondapur"),
            ("Siddharth Sen", "siddharth@intiruchi.com", "9812345678", "Tower B 1201, My Home Bhooja"),
            ("Meera Krishnan", "meera@intiruchi.com", "9812345679", "Flat 502, Orchid Springs, Manikonda"),
            ("Arjun Reddy", "customer@intiruchi.com", "9812345680", "Villa 9, Palm Grove, Financial District"),
        ]

        created_customers = []
        for name, email, phone, addr in customer_names:
            c_user = User(
                name=name,
                email=email,
                phone=phone,
                password_hash=hash_password("customer123"),
                role="CUSTOMER",
                address=addr,
                city="Hyderabad",
                pincode="500084",
                is_active=True,
            )
            db.add(c_user)
            db.commit()
            db.refresh(c_user)

            # Cart for each customer
            cart = Cart(customer_id=c_user.id)
            db.add(cart)
            db.commit()

            created_customers.append(c_user)

        print("Seeding 30+ Authentic Homemade Food Items...")
        foods_data = [
            # Cook 0: Amma's Traditional Kitchen
            {
                "cook_idx": 0,
                "name": "Authentic Andhra Pappu & Rice Thali",
                "description": "Slow-cooked toor dal with freshly picked garden gongura, seasoned with cumin, garlic and pure desi ghee. Served with hot steamed sona masoori rice, papad, and homemade avakaya pickle.",
                "category": "Lunch",
                "price": 149.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 15,
                "ingredients": "Sona Masoori Rice, Toor Dal, Gongura Leaves, Pure Ghee, Garlic, Dried Red Chilies, Mustard",
                "food_type": "VEG",
                "preparation_time": "25 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 0,
                "name": "Crispy Ghee Podi Thatte Idli (3 Pcs)",
                "description": "Steamed fluffy Karnataka-style Thatte idlis slathered generously with spicy aromatic gun powder (karam podi) and warm melted cow ghee. Accompanied by fresh coconut chutney and piping hot sambar.",
                "category": "Breakfast",
                "price": 119.0,
                "discount_price": 79.0,
                "is_evening_offer": True,
                "quantity": 8,
                "ingredients": "Fermented Rice & Urad batter, Chana dal podi, Pure Cow Ghee, Fresh Coconut, Curry Leaves",
                "food_type": "VEG",
                "preparation_time": "15 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 0,
                "name": "Spicy Andhra Chicken Vepudu",
                "description": "Homestyle bone-in farm chicken pan-roasted dry with freshly roasted coriander seeds, black peppercorns, curry leaves, and green chillies.",
                "category": "Dinner",
                "price": 220.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 12,
                "ingredients": "Country Chicken, Onions, Curry Leaves, Black Pepper, Coriander, Ginger-Garlic paste",
                "food_type": "NON_VEG",
                "preparation_time": "35 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 0,
                "name": "Homemade Avakaya Curd Rice Bowl",
                "description": "Creamy soothing curd rice tempered with mustard, ginger, green chilies, pomegranate pearls, paired with traditional Andhra mango avakaya.",
                "category": "Lunch",
                "price": 110.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Steamed Rice, Fresh Buffalo Curd, Milk, Mustard Seeds, Ginger, Curry Leaves, Pomegranate",
                "food_type": "VEG",
                "preparation_time": "10 mins",
                "is_available": True,
                "is_today_menu": False,
                "image_url": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 0,
                "name": "Traditional Rava Kesari",
                "description": "Auspicious melt-in-mouth semolina dessert rich with saffron infusion, golden roasted cashews, plump raisins, and abundant pure ghee.",
                "category": "Desserts",
                "price": 89.0,
                "discount_price": 59.0,
                "is_evening_offer": True,
                "quantity": 6,
                "ingredients": "Roasted Semolina (Rava), Saffron, Cardamom, Pure Ghee, Sugar, Cashews, Raisins",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1605197161470-5b48e6fbe6c6?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 0,
                "name": "Pesarattu Upma Combo",
                "description": "Crisp green gram dosa filled with lightly spiced ginger rava upma, served with tangy ginger allam pachadi and coconut chutney.",
                "category": "Breakfast",
                "price": 129.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Whole Moong Dal, Ginger, Green Chillies, Cumin, Semolina Upma, Ghee",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
            },

            # Cook 1: Hyderabadi Shahi Zaika
            {
                "cook_idx": 1,
                "name": "Shahi Hyderabadi Mutton Dum Biryani",
                "description": "Authentic Kachchi Dum Biryani prepared with tender marinated young goat meat, fragrant aged long-grain Basmati rice, saffron-infused milk, caramelized onions, and royal spices. Served with Mirchi ka Salan and creamy Raita.",
                "category": "Biryani",
                "price": 320.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 14,
                "ingredients": "Aged Basmati Rice, Tender Mutton, Saffron, Shahi Jeera, Mint, Fried Onions, Pure Ghee, Whole Garam Masala",
                "food_type": "NON_VEG",
                "preparation_time": "45 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 1,
                "name": "Nizami Chicken Dum Biryani",
                "description": "Succulent chicken drumsticks slow-dum cooked sealed with dough over wood embers. Layered with saffron rice, fresh mint, and coriander.",
                "category": "Biryani",
                "price": 249.0,
                "discount_price": 179.0,
                "is_evening_offer": True,
                "quantity": 5,
                "ingredients": "Basmati Rice, Fresh Chicken, Yoghurt, Mint, Coriander, Brown Onions, Ghee, Spices",
                "food_type": "NON_VEG",
                "preparation_time": "40 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 1,
                "name": "Royal Shahi Tukda",
                "description": "Crispy golden fried bread steeped in cardamom syrup, bathed in thick simmered rabri reduction, garnished with sliced silver almonds and pistachios.",
                "category": "Desserts",
                "price": 109.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Bread slices, Condensed milk rabri, Cardamom, Saffron, Pistachios, Almonds, Rose water",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1599785209796-786432b228bc?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 1,
                "name": "Smoked Chicken Seekh Kebabs (4 Pcs)",
                "description": "Fine minced chicken spiced with royal herbs, roasted on skewers over charcoal, served with mint chutney and onion rings.",
                "category": "Snacks",
                "price": 199.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 12,
                "ingredients": "Minced Chicken, Green chillies, Mint, Garam masala, Ginger, Lemon juice, Butter",
                "food_type": "NON_VEG",
                "preparation_time": "30 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 1,
                "name": "Vegetable Dum Biryani (Hyderabadi Style)",
                "description": "Garden fresh beans, carrots, cauliflower, and soft paneer cubes marinated in biryani spices and layered with saffron Basmati rice.",
                "category": "Biryani",
                "price": 189.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 15,
                "ingredients": "Basmati Rice, Paneer, Beans, Carrots, Peas, Yoghurt, Mint, Biryani spices",
                "food_type": "VEG",
                "preparation_time": "35 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 1,
                "name": "Mirchi Ka Salan (Side Bowl)",
                "description": "Traditional accompaniment for biryanis made with long Bhavnagri chillies in a roasted peanut, sesame, and tamarind gravy.",
                "category": "Lunch",
                "price": 80.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 20,
                "ingredients": "Large Green Chillies, Peanuts, White Sesame, Tamarind, Coconut, Cumin, Mustard",
                "food_type": "VEG",
                "preparation_time": "15 mins",
                "is_available": True,
                "is_today_menu": False,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
            },

            # Cook 2: Dadi's Desi Rasoi
            {
                "cook_idx": 2,
                "name": "Amritsari Aloo Pyaaz Paratha Meal (2 Pcs)",
                "description": "Stuffed whole wheat parathas roasted crisp on a heavy iron tawa with white homemade butter. Served with fresh curd, mango pickle, and green mint chutney.",
                "category": "Breakfast",
                "price": 139.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 15,
                "ingredients": "Stone-ground Whole Wheat Atta, Potatoes, Chopped Onions, Anardana, Green Chillies, Fresh Makhan",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 2,
                "name": "Slow-Cooked Dal Makhani & Jeera Rice",
                "description": "Black lentils and kidney beans simmered overnight on slow charcoal fire with tomatoes, ginger, cream, and butter. Paired with fragrant cumin basmati rice.",
                "category": "Dinner",
                "price": 179.0,
                "discount_price": 119.0,
                "is_evening_offer": True,
                "quantity": 7,
                "ingredients": "Urad Sabut, Rajma, Fresh Cream, Butter, Kashmiri Chilli, Ginger, Kasuri Methi",
                "food_type": "VEG",
                "preparation_time": "30 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 2,
                "name": "Homestyle Paneer Butter Masala (300ml)",
                "description": "Soft malai paneer cubes tossed in rich tomato-cashew satin gravy flavored with kasuri methi and roasted cumin. Mildly sweet and comforting.",
                "category": "Lunch",
                "price": 189.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Fresh Cottage Cheese (Paneer), Tomatoes, Cashews, Cream, Butter, Spices",
                "food_type": "VEG",
                "preparation_time": "25 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 2,
                "name": "Grandma's Rajma Chawal Bowl",
                "description": "Signature Sunday Punjabi comfort meal. Kashmiri red kidney beans cooked in thick onion-tomato gravy with steamed long-grain rice.",
                "category": "Lunch",
                "price": 149.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 12,
                "ingredients": "Kashmiri Rajma, Rice, Tomatoes, Onions, Ginger, Garlic, Cumin, Desi Ghee",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 2,
                "name": "Fluffy Phulka Roti Pack (4 Pcs)",
                "description": "Puffed on direct flame without oil, made from 100% MP Sharbati whole wheat, brushed with melted cow ghee.",
                "category": "Dinner",
                "price": 49.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 25,
                "ingredients": "Sharbati Wheat Flour, Water, Pure Desi Ghee",
                "food_type": "VEG",
                "preparation_time": "15 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 2,
                "name": "Homestyle Gajar Ka Halwa",
                "description": "Winter red carrots slow-simmered in whole milk and pure desi ghee, reduced with mawa, cardamom and slivered almonds.",
                "category": "Desserts",
                "price": 119.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Red Carrots, Full Cream Milk, Khoya, Desi Ghee, Sugar, Almonds, Pistachios",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": False,
                "image_url": "https://images.unsplash.com/photo-1605197161470-5b48e6fbe6c6?auto=format&fit=crop&w=600&q=80",
            },

            # Cook 3: Malabar Coast Kitchen
            {
                "cook_idx": 3,
                "name": "Kerala Lace Appam with Veg Stew (3 Pcs)",
                "description": "Soft-centered fermented rice appams with lacy crispy borders, paired with delicate coconut milk vegetable stew loaded with potatoes, carrots, and green peas.",
                "category": "Breakfast",
                "price": 149.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Fermented Rice Batter, Fresh Coconut Milk, Potatoes, Green Peas, Black Peppercorns, Cinnamon",
                "food_type": "VEG",
                "preparation_time": "25 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 3,
                "name": "Malabar Fish Curry with Steamed Rice",
                "description": "Fresh seer fish steak cooked in traditional clay pot with kudampuli (Malabar kokum), freshly ground coconut paste, fenugreek, and shallots.",
                "category": "Lunch",
                "price": 269.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 8,
                "ingredients": "Seer Fish (Surmai), Coconut, Kudampuli, Shallots, Curry Leaves, Mustard, Coconut Oil",
                "food_type": "NON_VEG",
                "preparation_time": "35 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 3,
                "name": "Kerala Egg Roast & Malabar Parotta (2 Pcs)",
                "description": "Flaky layered golden Kerala parottas served with spicy thick caramelized onion and tomato egg roast flavored with fennel.",
                "category": "Dinner",
                "price": 169.0,
                "discount_price": 115.0,
                "is_evening_offer": True,
                "quantity": 6,
                "ingredients": "Boiled Farm Eggs, Layered Parotta, Onions, Tomatoes, Fennel seeds, Curry leaves, Coconut oil",
                "food_type": "NON_VEG",
                "preparation_time": "25 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 3,
                "name": "Crispy Banana Fritters (Pazham Pori 4 Pcs)",
                "description": "Golden crispy fritters made with ripe Kerala Nendran plantains dipped in light cardamom-scented batter and deep fried to golden perfection.",
                "category": "Snacks",
                "price": 89.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 12,
                "ingredients": "Ripe Nendran Bananas, Flour, Cardamom, Cumin, Coconut oil",
                "food_type": "VEG",
                "preparation_time": "15 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 3,
                "name": "Authentic Kerala Chicken Stew",
                "description": "Tender chicken pieces cooked gently in velvety spiced coconut milk broth with baby potatoes, whole spices, and curry leaves.",
                "category": "Dinner",
                "price": 239.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Chicken, First-press Coconut Milk, Potatoes, Cloves, Cardamom, Ginger, Green Chillies",
                "food_type": "NON_VEG",
                "preparation_time": "30 mins",
                "is_available": True,
                "is_today_menu": False,
                "image_url": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 3,
                "name": "Ada Pradhaman Payasam",
                "description": "The crowned king of Kerala desserts made with soft rice flakes (ada), melted dark organic jaggery, thick coconut milk, and coconut chips.",
                "category": "Desserts",
                "price": 109.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 8,
                "ingredients": "Rice Ada, Marayoor Jaggery, Coconut Milk, Dry Ginger, Cardamom, Fried Cashews",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1599785209796-786432b228bc?auto=format&fit=crop&w=600&q=80",
            },

            # Cook 4: Prakriti Healthy Bowls
            {
                "cook_idx": 4,
                "name": "Foxtail Millet Khichdi with Roasted Flax Seeds",
                "description": "Nutrient-dense superfood khichdi prepared with organic foxtail millets (korra), yellow moong dal, carrots, spinach, and roasted flax seed topping.",
                "category": "Healthy Food",
                "price": 139.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 15,
                "ingredients": "Organic Foxtail Millet, Moong Dal, Carrots, Spinach, Cumin, Cold-pressed Sesame Oil, Flax seeds",
                "food_type": "VEG",
                "preparation_time": "20 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 4,
                "name": "High-Protein Sprouted Moong & Paneer Bowl",
                "description": "Raw live sprouted green gram tossed with diced low-fat paneer, cucumbers, cherry tomatoes, chia seeds, chaat spices, and fresh lemon dressing.",
                "category": "Healthy Food",
                "price": 129.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 12,
                "ingredients": "Sprouted Moong, Fresh Paneer, Cucumbers, Tomatoes, Lemon, Mint, Black Salt",
                "food_type": "VEG",
                "preparation_time": "10 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 4,
                "name": "Ragi Mudde with Organic Country Veg Sambar",
                "description": "Traditional calcium-rich finger millet balls served with freshly simmered drumstick and brinjal country sambar.",
                "category": "Lunch",
                "price": 119.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 10,
                "ingredients": "Ragi (Finger Millet) Flour, Toor Dal, Drumsticks, Brinjal, Sambar masala",
                "food_type": "VEG",
                "preparation_time": "25 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 4,
                "name": "Warm Roasted Pumpkin & Ginger Detox Soup",
                "description": "Velvety spiced soup made from roasted yellow pumpkin puree, grated ginger root, pumpkin seeds, and a hint of coconut cream.",
                "category": "Healthy Food",
                "price": 99.0,
                "discount_price": 69.0,
                "is_evening_offer": True,
                "quantity": 5,
                "ingredients": "Yellow Pumpkin, Fresh Ginger, Garlic, Coconut Milk, Pumpkin seeds, Black pepper",
                "food_type": "VEG",
                "preparation_time": "15 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 4,
                "name": "Oats & Dry Fruit Energy Laddoos (4 Pcs)",
                "description": "Guilt-free dessert naturally sweetened with Medjool dates and raw honey, packed with roasted rolled oats, almonds, and chia seeds. Zero refined sugar.",
                "category": "Desserts",
                "price": 129.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 15,
                "ingredients": "Rolled Oats, Dates, Raw Honey, Almonds, Walnuts, Chia seeds, Cardamom",
                "food_type": "VEG",
                "preparation_time": "10 mins",
                "is_available": True,
                "is_today_menu": False,
                "image_url": "https://images.unsplash.com/photo-1605197161470-5b48e6fbe6c6?auto=format&fit=crop&w=600&q=80",
            },
            {
                "cook_idx": 4,
                "name": "Masala Buttermilk with Moringa (300ml)",
                "description": "Refreshing churned curd beverage blended with fresh drumstick leaves (moringa), roasted cumin, ginger, and pink Himalayan rock salt.",
                "category": "Healthy Food",
                "price": 49.0,
                "discount_price": None,
                "is_evening_offer": False,
                "quantity": 20,
                "ingredients": "Desi Churned Curd, Fresh Moringa leaves, Ginger, Roasted Cumin, Himalayan Salt",
                "food_type": "VEG",
                "preparation_time": "5 mins",
                "is_available": True,
                "is_today_menu": True,
                "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
            },
        ]

        created_foods = []
        for fd in foods_data:
            cook = created_cooks[fd["cook_idx"]]
            f = Food(
                cook_id=cook.id,
                name=fd["name"],
                description=fd["description"],
                category=fd["category"],
                price=fd["price"],
                discount_price=fd["discount_price"],
                is_evening_offer=fd["is_evening_offer"],
                quantity=fd["quantity"],
                ingredients=fd["ingredients"],
                image_url=fd["image_url"],
                food_type=fd["food_type"],
                preparation_time=fd["preparation_time"],
                is_available=fd["is_available"],
                is_today_menu=fd["is_today_menu"],
            )
            db.add(f)
            db.commit()
            db.refresh(f)
            created_foods.append(f)

        print("Seeding Sample Reviews...")
        reviews_data = [
            (created_customers[0].id, created_foods[0].id, 5, "Reminds me of my mother's cooking in Vijayawada! The gongura pappu had the exact tangy bite and the rice was so hot and fresh."),
            (created_customers[1].id, created_foods[6].id, 5, "Unbelievable Shahi Biryani! The mutton pieces were falling off the bone and that saffron aroma was restaurant-beating."),
            (created_customers[2].id, created_foods[1].id, 5, "The Thatte Idli was so fluffy and the podi with pure ghee was heaven on a Saturday morning."),
            (created_customers[3].id, created_foods[12].id, 5, "Best Dal Makhani I have had in Hyderabad. Pure Punjabi homestyle, not overloaded with artificial cream."),
            (created_customers[4].id, created_foods[18].id, 4, "Appams were super soft with lacy edges, loved the veg stew with fresh coconut milk."),
            (created_customers[5].id, created_foods[24].id, 5, "Clean, wholesome millet khichdi. Finally healthy food that doesn't sacrifice on taste!"),
            (created_customers[9].id, created_foods[7].id, 5, "Ordered the Chicken Biryani during evening flash offer. Fantastic portion and incredible taste."),
        ]

        for cust_id, food_id, rating, comment in reviews_data:
            rev = Review(customer_id=cust_id, food_id=food_id, rating=rating, comment=comment)
            db.add(rev)
        db.commit()

        print("Seeding Sample Orders...")
        orders_data = [
            {
                "customer": created_customers[9],  # Demo customer
                "cook": created_cooks[1],
                "status": "DELIVERED",
                "payment_method": "UPI",
                "payment_status": "PAID",
                "items": [
                    (created_foods[7], 1),  # Nizami Biryani
                    (created_foods[8], 1),  # Shahi Tukda
                ],
            },
            {
                "customer": created_customers[9],  # Demo customer
                "cook": created_cooks[0],
                "status": "PREPARING",
                "payment_method": "COD",
                "payment_status": "PENDING",
                "items": [
                    (created_foods[0], 2),  # Andhra Thali
                    (created_foods[1], 1),  # Thatte Idli
                ],
            },
            {
                "customer": created_customers[0],
                "cook": created_cooks[2],
                "status": "DELIVERED",
                "payment_method": "CARD",
                "payment_status": "PAID",
                "items": [
                    (created_foods[12], 1),  # Dal Makhani
                    (created_foods[15], 2),  # Phulkas
                ],
            },
            {
                "customer": created_customers[1],
                "cook": created_cooks[3],
                "status": "ACCEPTED",
                "payment_method": "UPI",
                "payment_status": "PAID",
                "items": [
                    (created_foods[18], 2),  # Appam & Stew
                ],
            },
        ]

        for idx, o in enumerate(orders_data):
            subtotal = sum(item[0].price * item[1] for item in o["items"])
            delivery_fee = 35.0
            total = subtotal + delivery_fee
            ord_obj = Order(
                order_number=f"IR-DEMO{idx+1}00",
                customer_id=o["customer"].id,
                cook_id=o["cook"].id,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total_amount=total,
                delivery_address=o["customer"].address or "Hitec City, Hyderabad",
                city="Hyderabad",
                pincode="500081",
                phone=o["customer"].phone or "9876543210",
                payment_method=o["payment_method"],
                payment_status=o["payment_status"],
                order_status=o["status"],
                special_instructions="Please make it medium spicy, thank you!",
            )
            db.add(ord_obj)
            db.commit()
            db.refresh(ord_obj)

            for food_item, qty in o["items"]:
                oi = OrderItem(
                    order_id=ord_obj.id,
                    food_id=food_item.id,
                    food_name=food_item.name,
                    quantity=qty,
                    price=food_item.price,
                )
                db.add(oi)
            db.commit()

        print("Seeding Favorites & Subscriptions...")
        # Add 2 favorites for demo customer
        fav1 = Favorite(customer_id=created_customers[9].id, food_id=created_foods[0].id)
        fav2 = Favorite(customer_id=created_customers[9].id, food_id=created_foods[7].id)
        db.add_all([fav1, fav2])

        # Active Meal Subscription for demo customer
        sub = Subscription(
            customer_id=created_customers[9].id,
            cook_id=created_cooks[0].id,
            plan_name="Daily Homestyle Lunch Tiffin",
            plan_type="DAILY_LUNCH",
            start_date="2026-09-01",
            delivery_time="12:30 PM",
            delivery_address="Villa 9, Palm Grove, Financial District",
            price=2499.0,
            status="ACTIVE",
            notes="Please include extra curd rice on Fridays.",
        )
        db.add(sub)

        # Welcome notifications
        welcome_notif = Notification(
            user_id=created_customers[9].id,
            title="Welcome to Inti Ruchi! 🍲",
            message="Discover delicious authentic meals prepared by verified home cooks near you. Enjoy ₹50 off on your first order!",
            type="SYSTEM",
        )
        db.add(welcome_notif)

        db.commit()
        print("Database successfully seeded with complete authentic data!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
