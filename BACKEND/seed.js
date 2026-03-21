const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Boarding = require("./Model/BoardingModel");

dotenv.config();

// We have 6 generated realistic images. We will rotate them across 20 boardings.
const images = [
  "sri_lankan_boarding_1_1774088200115.png",
  "sri_lankan_boarding_2_1774088223397.png",
  "sri_lankan_boarding_3_1774088391768.png",
  "sri_lankan_boarding_4_1774088424924.png",
  "sri_lankan_boarding_5_1774088444368.png",
  "sri_lankan_boarding_6_1774089582975.png"
];

const sampleData = [
    {
        title: "Modern SLIIT Boys Boarding - Malabe",
        description: "Brand new modern boarding facility very close to SLIIT Malabe. Includes high-speed SLT fiber, fully tiled floors, and luxury attached bathrooms. Meals can be arranged. Perfect for software engineering students.",
        address: "New Kandy Road, Pittugala, Malabe",
        distanceFromUniversity: 0.5,
        pricePerMonth: 22000,
        roomType: "Single",
        genderType: "Male",
        facilities: ["WiFi", "Water", "Parking", "CCTV", "Food"],
        availability: true,
        rating: 4.8,
        contactNumber: "0771234567",
        ownerName: "Kasun Jayasuriya",
        images: [images[5]],
        videos: []
    },
    {
        title: "Malabe Girls Hostel near SLIIT & CINEC",
        description: "Safe and secure hostel for girls in Malabe. 10 minutes walk to SLIIT and CINEC campus. 24/7 security, fingerprint access, and home-cooked healthy meals (breakfast & dinner) included.",
        address: "Thalahena, Malabe",
        distanceFromUniversity: 1.2,
        pricePerMonth: 18000,
        roomType: "Shared",
        genderType: "Female",
        facilities: ["WiFi", "Food", "CCTV", "Water", "Laundry"],
        availability: true,
        rating: 4.5,
        contactNumber: "0712348899",
        ownerName: "Champa Wijeratne",
        images: [images[0]],
        videos: []
    },
    {
        title: "Luxury AC Annex - Malabe Town",
        description: "Modern lifestyle annex for SLIIT or Horizon Campus students. Fully air-conditioned, private kitchen, washing machine, and parking space. Perfect for final year students needing a quiet environment.",
        address: "Kaduwela Road, Malabe",
        distanceFromUniversity: 2.0,
        pricePerMonth: 35000,
        roomType: "Single",
        genderType: "Any",
        facilities: ["AC", "WiFi", "Water", "Parking", "CCTV", "Laundry"],
        availability: true,
        rating: 5.0,
        contactNumber: "0777999888",
        ownerName: "Anil Fernando",
        images: [images[1]],
        videos: []
    },
    {
        title: "Nugegoda Boys Annex - Japura",
        description: "Affordable shared room for male students near University of Sri Jayewardenepura. Quiet neighborhood, good bus routes to Colombo. Warm water available. Nearby kade and restaurants.",
        address: "23, Gangodawila, Nugegoda",
        distanceFromUniversity: 1.5,
        pricePerMonth: 9500,
        roomType: "Shared",
        genderType: "Male",
        facilities: ["WiFi", "Parking", "Water"],
        availability: true,
        rating: 4.2,
        contactNumber: "0772345678",
        ownerName: "Gayan Bandara",
        images: [images[2]],
        videos: []
    },
    {
        title: "Serenity Boarding House - Jaffna",
        description: "Well-maintained boarding house for both male and female students near University of Jaffna. Separate floors for boys and girls. Tamil and Sinhala speaking owner. Generator backup available.",
        address: "56/1, Kankesanthurai Road, Jaffna",
        distanceFromUniversity: 1.0,
        pricePerMonth: 8000,
        roomType: "Shared",
        genderType: "Any",
        facilities: ["WiFi", "Water", "CCTV"],
        availability: true,
        rating: 4.5,
        contactNumber: "0213336689",
        ownerName: "Thilaga Krishnaswamy",
        images: [images[3]],
        videos: []
    },
    {
        title: "Nandani's Premium Boarding - Colombo 7",
        description: "Fully furnished single room in a safe residential area in Colombo 7. AC room, private attached bathroom. Ideal for female Colombo University students and working ladies. Security guard on premises.",
        address: "18, Horton Place, Colombo 07",
        distanceFromUniversity: 2.2,
        pricePerMonth: 25000,
        roomType: "Single",
        genderType: "Female",
        facilities: ["WiFi", "AC", "CCTV", "Laundry", "Water"],
        availability: false,
        rating: 5.0,
        contactNumber: "0112677890",
        ownerName: "Nandani Fernando",
        images: [images[4]],
        videos: []
    },
    {
        title: "Rupasinghe Student Boarding - Kelaniya",
        description: "Budget boarding near University of Kelaniya. Easy access to the main campus by walk. Meals available nearby. Double rooms available at lower price. Very popular among first-year students.",
        address: "34/C, Dalugama, Kelaniya",
        distanceFromUniversity: 0.5,
        pricePerMonth: 7500,
        roomType: "Shared",
        genderType: "Male",
        facilities: ["WiFi", "Water", "Parking"],
        availability: true,
        rating: 4.0,
        contactNumber: "0112910345",
        ownerName: "Priyantha Rupasinghe",
        images: [images[5]],
        videos: []
    },
    {
        title: "Malini Akka's Boarding - Matara",
        description: "Homely and affordable boarding near University of Ruhuna in Matara. Both male and female floors available. Breakfast and dinner provided. Nice garden area for relaxing after studies.",
        address: "77, Rahula Road, Matara",
        distanceFromUniversity: 1.8,
        pricePerMonth: 11000,
        roomType: "Single",
        genderType: "Any",
        facilities: ["WiFi", "Food", "Water", "Laundry"],
        availability: true,
        rating: 4.6,
        contactNumber: "0412224567",
        ownerName: "Malini Disanayake",
        images: [images[0]],
        videos: []
    },
    {
        title: "Sunrise Boys Hostel - Ampara",
        description: "Spacious shared rooms for male students near EUSL South Eastern University Ampara campus. Friendly environment, common study room available. RO water purifier. Very affordable for rural university students.",
        address: "12, D.S. Senanayake Street, Ampara",
        distanceFromUniversity: 0.6,
        pricePerMonth: 6500,
        roomType: "Shared",
        genderType: "Male",
        facilities: ["Water", "WiFi"],
        availability: true,
        rating: 3.9,
        contactNumber: "0632222345",
        ownerName: "Aruna Wijesinghe",
        images: [images[1]],
        videos: []
    },
    {
        title: "Sunethra Ladies Annex - Gampaha",
        description: "Clean and secure girls-only boarding near Kelaniya University Gampaha campus / Wickramarachchi campus. Curfew at 10PM, CCTV monitored. Laundry room available. Monthly rate includes electricity and water bills.",
        address: "89/A, Kirillawala Road, Gampaha",
        distanceFromUniversity: 1.2,
        pricePerMonth: 13500,
        roomType: "Single",
        genderType: "Female",
        facilities: ["WiFi", "CCTV", "Laundry", "Water"],
        availability: true,
        rating: 4.7,
        contactNumber: "0331223456",
        ownerName: "Sunethra Jayawardena",
        images: [images[2]],
        videos: []
    },
    {
        title: "Lakshmi Boarding - Vavuniya",
        description: "Simple and clean boarding near Vavuniya Campus of University of Vavuniya. Suitable for both Sinhala and Tamil students. Vegetarian meals available. Generator facility during power cuts.",
        address: "29, Hospital Road, Vavuniya",
        distanceFromUniversity: 0.9,
        pricePerMonth: 7000,
        roomType: "Shared",
        genderType: "Any",
        facilities: ["Food", "Water", "WiFi"],
        availability: false,
        rating: 4.1,
        contactNumber: "0242234567",
        ownerName: "Lakshmi Tharmalingam",
        images: [images[3]],
        videos: []
    },
    {
        title: "Sampath AC Boarding - Peradeniya",
        description: "Premium single AC rooms for university students in Peradeniya. Private attached bathroom, study table and wardrobe included. 5 minutes walk to University of Peradeniya Engineering Faculty.",
        address: "4/1, Galaha Road, Peradeniya, Kandy",
        distanceFromUniversity: 0.3,
        pricePerMonth: 20000,
        roomType: "Single",
        genderType: "Any",
        facilities: ["WiFi", "AC", "Water", "Parking", "Laundry"],
        availability: true,
        rating: 4.9,
        contactNumber: "0772987654",
        ownerName: "Sampath Senaratne",
        images: [images[4]],
        videos: []
    },
    {
        title: "Mihira's Dorm - Moratuwa",
        description: "Perfect for University of Moratuwa engineering and architecture students. Large drawing tables available. 24/7 WiFi and generator. Safe environment.",
        address: "45, Katubedda, Moratuwa",
        distanceFromUniversity: 0.5,
        pricePerMonth: 15000,
        roomType: "Shared",
        genderType: "Male",
        facilities: ["WiFi", "Water", "Parking", "CCTV"],
        availability: true,
        rating: 4.8,
        contactNumber: "0112345670",
        ownerName: "Mihira Kumara",
        images: [images[5]],
        videos: []
    },
    {
        title: "Green View Boarding - Rajarata",
        description: "Located right next to Rajarata University in Mihintale. Beautiful paddy field view. Delicious authentic Sri Lankan rice and curry provided.",
        address: "10, Mihintale Road, Anuradhapura",
        distanceFromUniversity: 1.2,
        pricePerMonth: 8500,
        roomType: "Shared",
        genderType: "Any",
        facilities: ["Food", "Water", "WiFi"],
        availability: true,
        rating: 4.4,
        contactNumber: "0253456789",
        ownerName: "Kamala Bandara",
        images: [images[0]],
        videos: []
    },
    {
        title: "Wayamba Uni Boarding - Kuliyapitiya",
        description: "A large house converted into a hostel for Wayamba University students. Very close to the Kuliyapitiya campus. Large garden, safe and secure.",
        address: "12, Main Street, Kuliyapitiya",
        distanceFromUniversity: 0.8,
        pricePerMonth: 9000,
        roomType: "Shared",
        genderType: "Male",
        facilities: ["Water", "WiFi", "Parking"],
        availability: true,
        rating: 4.3,
        contactNumber: "0371234567",
        ownerName: "Saman Perera",
        images: [images[1]],
        videos: []
    },
    {
        title: "Uva Wellassa Hostels - Badulla",
        description: "Cold climate friendly boarding house with warm water facilities. Specifically made for Uva Wellassa University students. Quiet place for studying.",
        address: "88, Passara Road, Badulla",
        distanceFromUniversity: 1.5,
        pricePerMonth: 10000,
        roomType: "Single",
        genderType: "Female",
        facilities: ["Water", "WiFi", "Food"],
        availability: true,
        rating: 4.6,
        contactNumber: "0559876543",
        ownerName: "Nayana Weerasinghe",
        images: [images[2]],
        videos: []
    },
    {
        title: "Sabaragamuwa Stay - Belihuloya",
        description: "Cozy rooms facing the mountains near Sabaragamuwa University. Extremely clean, brand new beds. High-speed internet is available.",
        address: "33, Belihuloya, Ratnapura",
        distanceFromUniversity: 2.5,
        pricePerMonth: 11500,
        roomType: "Single",
        genderType: "Any",
        facilities: ["WiFi", "Water", "Laundry"],
        availability: true,
        rating: 4.8,
        contactNumber: "0456789012",
        ownerName: "Chandana Rajapakse",
        images: [images[3]],
        videos: []
    },
    {
        title: "Sumudu Ladies Boarding - Kandy",
        description: "Safe and comfortable boarding exclusively for female students near Kandy city. Home-cooked Sri Lankan meals included. Very close to University of Peradeniya main gate. Friendly aunty, very clean rooms.",
        address: "142/B, Rajapihilla Mawatha, Kandy",
        distanceFromUniversity: 0.8,
        pricePerMonth: 12000,
        roomType: "Single",
        genderType: "Female",
        facilities: ["WiFi", "Food", "CCTV", "Laundry", "Water"],
        availability: true,
        rating: 4.8,
        contactNumber: "0812205567",
        ownerName: "Menike Rajapaksha",
        images: [images[4]],
        videos: []
    },
    {
        title: "SLIIT Boys Budget Dorms - Pittugala",
        description: "Cheap dorm-style sharing accommodation exclusively for boys near SLIIT Malabe. Includes utilities inside the monthly price. Very friendly environment and walking distance to Kaduwela Road bustand.",
        address: "14, Kahanthota Road, Pittugala",
        distanceFromUniversity: 0.4,
        pricePerMonth: 7000,
        roomType: "Shared",
        genderType: "Male",
        facilities: ["Water", "WiFi"],
        availability: true,
        rating: 3.5,
        contactNumber: "0788887755",
        ownerName: "Sunil Wimalasiri",
        images: [images[5]],
        videos: []
    },
    {
        title: "Luxury Girls Boarding near NSBM",
        description: "Only minutes away from NSBM Green University Town in Pitipana, Homagama. Includes swimming pool access, modern AC rooms, and gourmet meals daily. Top tier facility.",
        address: "Green Valley Heights, Homagama",
        distanceFromUniversity: 0.9,
        pricePerMonth: 45000,
        roomType: "Shared",
        genderType: "Female",
        facilities: ["AC", "WiFi", "Food", "CCTV", "Parking", "Water"],
        availability: true,
        rating: 5.0,
        contactNumber: "0770001122",
        ownerName: "Malathie Silva",
        images: [images[1]],
        videos: []
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await Boarding.deleteMany({});
        console.log("🗑️  Cleared existing boardings");

        await Boarding.insertMany(sampleData);
        console.log("🎉 20 Sri Lankan sample boardings inserted successfully!");

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedDatabase();
