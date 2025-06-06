# Comprehensive Fitness Specialties Catalog for LiftLink
# Following the established design philosophy with organized categories

FITNESS_SPECIALTIES = {
    # Strength & Power Training
    "strength_power": {
        "category": "Strength & Power",
        "icon": "💪",
        "animated_svg": "AnimatedDumbbell",
        "color": "#C4D600",
        "specialties": [
            "Strength Training",
            "Powerlifting",
            "Olympic Weightlifting", 
            "Bodybuilding",
            "Functional Strength",
            "Strongman Training",
            "Kettlebell Training",
            "Resistance Band Training",
            "CrossFit",
            "Compound Movements"
        ]
    },
    
    # Cardiovascular & Endurance
    "cardio_endurance": {
        "category": "Cardio & Endurance",
        "icon": "🏃",
        "animated_svg": "AnimatedRunning", 
        "color": "#C4D600",
        "specialties": [
            "HIIT",
            "Running Coaching",
            "Marathon Training", 
            "Sprint Training",
            "Cycling Training",
            "Swimming Coaching",
            "Triathlon Training",
            "Interval Training",
            "Circuit Training",
            "Endurance Building"
        ]
    },
    
    # Weight Management
    "weight_management": {
        "category": "Weight Management",
        "icon": "⚖️", 
        "animated_svg": "AnimatedScale",
        "color": "#C4D600",
        "specialties": [
            "Weight Loss",
            "Fat Burning",
            "Lean Muscle Building",
            "Body Recomposition",
            "Metabolic Training",
            "Nutrition Coaching",
            "Lifestyle Coaching",
            "Portion Control",
            "Meal Planning",
            "Sustainable Weight Loss"
        ]
    },
    
    # Flexibility & Recovery
    "flexibility_recovery": {
        "category": "Flexibility & Recovery", 
        "icon": "🧘",
        "animated_svg": "AnimatedYoga",
        "color": "#C4D600",
        "specialties": [
            "Yoga",
            "Pilates",
            "Stretching",
            "Mobility Training",
            "Flexibility Training",
            "Recovery Coaching",
            "Injury Prevention", 
            "Corrective Exercise",
            "Postural Correction",
            "Movement Quality"
        ]
    },
    
    # Sports Performance
    "sports_performance": {
        "category": "Sports Performance",
        "icon": "🏆",
        "animated_svg": "AnimatedTrophy",
        "color": "#C4D600", 
        "specialties": [
            "Athletic Performance",
            "Sports-Specific Training",
            "Agility Training",
            "Speed Training",
            "Plyometric Training",
            "Balance Training",
            "Coordination Training",
            "Reaction Time",
            "Sports Conditioning",
            "Competition Prep"
        ]
    },
    
    # Specialized Populations
    "specialized_populations": {
        "category": "Specialized Populations",
        "icon": "👥",
        "animated_svg": "AnimatedGroup",
        "color": "#C4D600",
        "specialties": [
            "Senior Fitness",
            "Youth Training",
            "Prenatal Fitness",
            "Postnatal Recovery",
            "Disability Training",
            "Medical Exercise",
            "Chronic Disease Management",
            "Arthritis Management",
            "Diabetes Management",
            "Heart Disease Recovery"
        ]
    },
    
    # Functional & Movement
    "functional_movement": {
        "category": "Functional & Movement",
        "icon": "🏃‍♂️",
        "animated_svg": "AnimatedMovement", 
        "color": "#C4D600",
        "specialties": [
            "Functional Training",
            "Movement Screening",
            "Daily Living Activities",
            "Occupational Health",
            "Ergonomics Training",
            "Fall Prevention",
            "Balance Training",
            "Gait Training",
            "Workplace Wellness",
            "Activities of Daily Living"
        ]
    },
    
    # Mental & Mindful Fitness
    "mental_mindful": {
        "category": "Mental & Mindful",
        "icon": "🧠",
        "animated_svg": "AnimatedBrain",
        "color": "#C4D600",
        "specialties": [
            "Mind-Body Training",
            "Stress Management",
            "Mental Health Fitness",
            "Meditation Coaching",
            "Breathwork Training",
            "Anxiety Management",
            "Depression Support",
            "Confidence Building",
            "Goal Setting",
            "Mindful Movement"
        ]
    },
    
    # Combat & Martial Arts
    "combat_martial_arts": {
        "category": "Combat & Martial Arts",
        "icon": "🥊",
        "animated_svg": "AnimatedBoxing",
        "color": "#C4D600",
        "specialties": [
            "Boxing Training",
            "MMA Training",
            "Kickboxing",
            "Martial Arts",
            "Self-Defense",
            "Combat Conditioning",
            "Fighter Preparation",
            "Technique Training",
            "Sparring Coaching",
            "Mental Toughness"
        ]
    },
    
    # Dance & Creative Movement
    "dance_creative": {
        "category": "Dance & Creative Movement",
        "icon": "💃",
        "animated_svg": "AnimatedDance",
        "color": "#C4D600",
        "specialties": [
            "Dance Fitness",
            "Zumba",
            "Ballet Fitness",
            "Hip Hop Fitness",
            "Latin Dance",
            "Creative Movement",
            "Rhythm Training",
            "Expression Training",
            "Performance Prep",
            "Choreography"
        ]
    },
    
    # Outdoor & Adventure
    "outdoor_adventure": {
        "category": "Outdoor & Adventure",
        "icon": "🏔️", 
        "animated_svg": "AnimatedMountain",
        "color": "#C4D600",
        "specialties": [
            "Outdoor Fitness",
            "Hiking Training", 
            "Rock Climbing",
            "Adventure Racing",
            "Obstacle Course Training",
            "Wilderness Fitness",
            "Trail Running",
            "Mountaineering Prep",
            "Survival Fitness",
            "Nature Workouts"
        ]
    },
    
    # Technology & Data
    "technology_data": {
        "category": "Technology & Data",
        "icon": "📱",
        "animated_svg": "AnimatedPhone",
        "color": "#C4D600",
        "specialties": [
            "Wearable Tech Training",
            "Data-Driven Fitness",
            "Heart Rate Training",
            "Performance Analytics",
            "Progress Tracking",
            "Virtual Training",
            "App-Based Coaching",
            "Biometric Analysis",
            "Fitness Technology",
            "Digital Wellness"
        ]
    }
}

# Flat list of all specialties for easy lookup
ALL_SPECIALTIES = []
for category_data in FITNESS_SPECIALTIES.values():
    ALL_SPECIALTIES.extend(category_data["specialties"])

# Most popular specialties for quick filters
POPULAR_SPECIALTIES = [
    "Weight Loss",
    "Strength Training", 
    "HIIT",
    "Yoga",
    "Functional Training",
    "Boxing Training",
    "Running Coaching",
    "Bodybuilding",
    "CrossFit",
    "Pilates"
]

# Specialty categories for filtering
SPECIALTY_CATEGORIES = list(FITNESS_SPECIALTIES.keys())

def get_specialty_category(specialty):
    """Get the category for a given specialty"""
    for category_key, category_data in FITNESS_SPECIALTIES.items():
        if specialty in category_data["specialties"]:
            return category_key
    return None

def get_category_info(category_key):
    """Get full information about a specialty category"""
    return FITNESS_SPECIALTIES.get(category_key, {})

def get_specialties_by_category(category_key):
    """Get all specialties in a specific category"""
    category_data = FITNESS_SPECIALTIES.get(category_key, {})
    return category_data.get("specialties", [])

def search_specialties(query):
    """Search for specialties matching a query"""
    query_lower = query.lower()
    matches = []
    
    for specialty in ALL_SPECIALTIES:
        if query_lower in specialty.lower():
            matches.append(specialty)
    
    return matches

# For demo data - sample trainer specialties
DEMO_TRAINER_SPECIALTIES = {
    "trainer001": ["Strength Training", "Powerlifting", "Functional Training", "Athletic Performance"],
    "trainer002": ["Yoga", "Pilates", "Meditation Coaching", "Stress Management", "Flexibility Training"],
    "trainer003": ["CrossFit", "HIIT", "Functional Training", "Olympic Weightlifting", "Circuit Training"],
    "trainer004": ["Boxing Training", "MMA Training", "Self-Defense", "Combat Conditioning", "Mental Toughness"],
    "trainer005": ["Running Coaching", "Marathon Training", "Triathlon Training", "Endurance Building", "Cycling Training"],
    "trainer006": ["Bodybuilding", "Lean Muscle Building", "Nutrition Coaching", "Competition Prep", "Body Recomposition"],
    "trainer007": ["Senior Fitness", "Medical Exercise", "Fall Prevention", "Arthritis Management", "Chronic Disease Management"],
    "trainer008": ["Dance Fitness", "Zumba", "Creative Movement", "Hip Hop Fitness", "Performance Prep"],
    "trainer009": ["Outdoor Fitness", "Hiking Training", "Rock Climbing", "Adventure Racing", "Wilderness Fitness"],
    "trainer010": ["Mental Health Fitness", "Stress Management", "Anxiety Management", "Depression Support", "Mindful Movement"]
}
