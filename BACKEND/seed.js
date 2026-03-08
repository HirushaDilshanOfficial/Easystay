const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Boarding = require("./Model/BoardingModel");

dotenv.config();

const sampleData = [
    {
        title: "Luxury Single Room Near Campus",
        description: "A beautiful, fully furnished single room just a short walk from the university. Includes a private study desk and high-speed WiFi.",
        address: "123 University Avenue, Block A",
        distanceFromUniversity: 0.5,
        pricePerMonth: 15000,
        roomType: "Single",
        genderType: "Any",
        facilities: ["WiFi", "AC", "Laundry", "Water"],
        availability: true,
        rating: 4.8,
        contactNumber: "0771234567",
        ownerName: "Kamal Perera",
        images: [],
        videos: []
    },
    {
        title: "Affordable Shared Dormitory",
        description: "Budget-friendly shared room for 2 students. Quiet environment perfect for studying. Meals can be arranged upon request.",
        address: "45 College Road, 2nd Floor",
        distanceFromUniversity: 1.2,
        pricePerMonth: 8000,
        roomType: "Shared",
        genderType: "Boys only", // Wait, enum is ["Male", "Female", "Any"]
        facilities: ["WiFi", "Parking", "Water"],
        availability: true,
        rating: 4.2,
        contactNumber: "0719876543",
        ownerName: "Nimal Peiris",
        images: [],
        videos: []
    },
    {
        title: "Premium Girls Lodge with Meals",
        description: "Safe and secure lodge exclusively for female students. CCTV monitored. Delicious home-cooked meals provided daily.",
        address: "78 Rose Garden Mawatha",
        distanceFromUniversity: 2.0,
        pricePerMonth: 22000,
        roomType: "Shared",
        genderType: "Female",
        facilities: ["WiFi", "Food", "CCTV", "Laundry", "Water"],
        availability: false,
        rating: 5.0,
        contactNumber: "0751122334",
        ownerName: "Samanthi Silva",
        images: [],
        videos: []
    },
    {
        title: "Cozy Studio near Science Faculty",
        description: "Independent studio apartment with a small kitchenette. Very close to the science faculty entrance.",
        address: "12/A Science Road",
        distanceFromUniversity: 0.2,
        pricePerMonth: 18000,
        roomType: "Single",
        genderType: "Any",
        facilities: ["WiFi", "AC", "Parking", "Water"],
        availability: true,
        rating: 4.5,
        contactNumber: "0723344556",
        ownerName: "Ruwan Rajapaksha",
        images: [],
        videos: []
    }
];

// Fix Boy only -> Male
sampleData[1].genderType = "Male";

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing data (optional, let's keep it simple and just insert)
        await Boarding.deleteMany({});
        console.log("Cleared existing boardings");

        await Boarding.insertMany(sampleData);
        console.log("Sample data inserted successfully");

        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedDatabase();
