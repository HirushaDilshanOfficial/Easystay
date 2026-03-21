const fs = require('fs');
const https = require('https');
const path = require('path');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Boarding = require("./Model/BoardingModel");

dotenv.config();

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filepath)) {
            console.log(`Image already exists: ${filepath}`);
            return resolve();
        }
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error('Failed to get ' + url + ' (' + res.statusCode + ')'));
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
};

const pexelsUrls = [
    "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=800"
];

const seedDatabase = async () => {
    try {
        console.log("⬇️  Downloading modern room images to local uploads folder...");
        for (let i = 0; i < pexelsUrls.length; i++) {
            const filepath = path.join(__dirname, 'uploads', `modern_room_${i}.jpg`);
            await downloadImage(pexelsUrls[i], filepath);
        }
        console.log("✅ Downloads complete!");

        const realImages = [
            "ikman1.jpg",
            "ikman2.jpg",
            "ikman3.jpg",
            "ikman4.jpg",
            "ikman5.jpg",
            "modern_room_0.jpg",
            "modern_room_1.jpg",
            "modern_room_2.jpg",
            "modern_room_3.jpg",
            "modern_room_4.jpg",
            "modern_room_5.jpg",
            "modern_room_6.jpg",
            "modern_room_7.jpg"
        ];
        
        const getImage = (index) => realImages[index % realImages.length];

        const sampleData = [
            {
                title: "Modern SLIIT Boys Boarding - Malabe",
                description: "Brand new modern boarding facility very close to SLIIT Malabe. Includes high-speed SLT fiber, fully tiled floors, luxury attached bathrooms, and a shared dining area.",
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
                images: ["ikman3.jpg", "modern_room_0.jpg", "ikman5.jpg"], 
                videos: []
            },
            {
                title: "Malabe Girls Hostel near SLIIT & CINEC",
                description: "Safe and secure hostel for girls in Malabe. 10 minutes walk to SLIIT and CINEC campus.",
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
                images: ["ikman2.jpg", "modern_room_1.jpg", "ikman4.jpg"],
                videos: []
            },
            {
                title: "Luxury AC Annex - Malabe Town",
                description: "Modern lifestyle annex for SLIIT or Horizon Campus students.",
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
                images: ["ikman3.jpg", "modern_room_2.jpg", "modern_room_4.jpg"],
                videos: []
            },
            {
                title: "Nugegoda Boys Annex - Japura",
                description: "Affordable shared room for male students near University of Sri Jayewardenepura.",
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
                images: ["ikman4.jpg", "modern_room_3.jpg", "ikman1.jpg"],
                videos: []
            },
            {
                title: "Serenity Boarding House - Jaffna",
                description: "Well-maintained boarding house for both male and female students near University of Jaffna.",
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
                images: ["ikman5.jpg", "modern_room_4.jpg", "ikman2.jpg"],
                videos: []
            },
            {
                title: "Nandani's Premium Boarding - Colombo 7",
                description: "Fully furnished single room in a safe residential area in Colombo.",
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
                images: [getImage(5), getImage(6), getImage(1)],
                videos: []
            },
            {
                title: "Rupasinghe Student Boarding - Kelaniya",
                description: "Budget boarding near University of Kelaniya.",
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
                images: [getImage(6), getImage(7), getImage(2)],
                videos: []
            },
            {
                title: "Malini Akka's Boarding - Matara",
                description: "Homely and affordable boarding near University of Ruhuna in Matara.",
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
                images: [getImage(7), getImage(8), getImage(3)],
                videos: []
            },
            {
                title: "Sunrise Boys Hostel - Ampara",
                description: "Spacious shared rooms for male students near EUSL.",
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
                images: [getImage(8), getImage(9), getImage(4)],
                videos: []
            },
            {
                title: "Sunethra Ladies Annex - Gampaha",
                description: "Clean and secure girls-only boarding near Kelaniya University.",
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
                images: [getImage(9), getImage(10), getImage(5)],
                videos: []
            },
            {
                title: "Lakshmi Boarding - Vavuniya",
                description: "Simple and clean boarding near Vavuniya Campus.",
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
                images: [getImage(10), getImage(11), getImage(6)],
                videos: []
            },
            {
                title: "Sampath AC Boarding - Peradeniya",
                description: "Premium single AC rooms for university students in Peradeniya.",
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
                images: [getImage(11), getImage(12), getImage(7)],
                videos: []
            },
            {
                title: "Mihira's Dorm - Moratuwa",
                description: "Perfect for University of Moratuwa engineering and architecture students.",
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
                images: [getImage(12), getImage(0), getImage(8)],
                videos: []
            },
            {
                title: "Green View Boarding - Rajarata",
                description: "Located right next to Rajarata University in Mihintale.",
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
                images: [getImage(13), getImage(1), getImage(9)],
                videos: []
            },
            {
                title: "Wayamba Uni Boarding - Kuliyapitiya",
                description: "A large house converted into a hostel for Wayamba University students.",
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
                images: [getImage(14), getImage(2), getImage(10)],
                videos: []
            },
            {
                title: "Uva Wellassa Hostels - Badulla",
                description: "Cold climate friendly boarding house with warm water facilities.",
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
                images: [getImage(15), getImage(3), getImage(11)],
                videos: []
            },
            {
                title: "Sabaragamuwa Stay - Belihuloya",
                description: "Cozy rooms facing the mountains near Sabaragamuwa University.",
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
                images: [getImage(16), getImage(4), getImage(12)],
                videos: []
            },
            {
                title: "Sumudu Ladies Boarding - Kandy",
                description: "Safe and comfortable boarding exclusively for female students.",
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
                images: [getImage(17), getImage(5), getImage(0)],
                videos: []
            },
            {
                title: "SLIIT Boys Budget Dorms - Pittugala",
                description: "Cheap dorm-style sharing accommodation exclusively for boys.",
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
                images: [getImage(18), getImage(6), getImage(1)],
                videos: []
            },
            {
                title: "Luxury Girls Boarding near NSBM",
                description: "Only minutes away from NSBM Green University Town in Pitipana.",
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
                images: [getImage(19), getImage(7), getImage(2)],
                videos: []
            }
        ];

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await Boarding.deleteMany({});
        console.log("🗑️  Cleared existing boardings");

        await Boarding.insertMany(sampleData);
        console.log("🎉 20 sample boardings inserted successfully! Local Pexels images generated!");

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedDatabase();
