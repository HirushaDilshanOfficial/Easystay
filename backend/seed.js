const fs = require('fs');
const https = require('https');
const path = require('path');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Boarding = require("./models/BoardingModel");

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

// We include a mix of modern and normal boarding stock photos
const pexelsUrls = [
    "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800", // Modern
    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800", // Modern
    "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=800", // Modern
    "https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=800", // Normal
    "https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800", // Modern
    "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800", // Normal
    "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800", // Normal
    "https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=800"  // Modern
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
            "Screenshot 2026-03-21 at 23.45.20.png",
            "Screenshot 2026-03-21 at 23.45.52.png",
            "Screenshot 2026-03-21 at 23.47.49.png",
            "Screenshot 2026-03-21 at 23.48.09.png",
            "Screenshot 2026-03-21 at 23.49.46.png",
            "Screenshot 2026-03-22 at 07.25.35.png",
            "Screenshot 2026-03-22 at 07.25.46.png",
            "Screenshot 2026-03-22 at 07.26.51.png",
            "Screenshot 2026-03-22 at 07.27.00.png",
            "Screenshot 2026-03-22 at 07.27.21.png",
            "Screenshot 2026-03-22 at 07.27.49.png",
            "Screenshot 2026-03-22 at 07.27.54.png",
            "Screenshot 2026-03-22 at 07.28.04.png",
            "Screenshot 2026-03-22 at 07.28.11.png",
            "Screenshot 2026-03-22 at 07.28.28.png"
        ];
        
        const getImage = (index) => realImages[index % realImages.length];

        const sampleData = [
            {
                title: "Modern SLIIT Boys Boarding - Malabe",
                description: "Brand new modern boarding facility very close to SLIIT Malabe. Includes high-speed SLT fiber, fully tiled floors, and luxury attached bathrooms.",
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
                images: [getImage(0)], 
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
                images: [getImage(1)],
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
                images: [getImage(2)],
                videos: []
            },
            {
                title: "SLIIT Boys Budget Dorms - Pittugala",
                description: "Cheap dorm-style normal sharing accommodation exclusively for boys.",
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
                images: [getImage(3)],
                videos: []
            },
            {
                title: "Weliwita Student Accommodation",
                description: "Clean normal boarding house just 1.5km to SLIIT Campus. Ideal for both male and female students.",
                address: "Weliwita Road, Malabe",
                distanceFromUniversity: 1.5,
                pricePerMonth: 8000,
                roomType: "Shared",
                genderType: "Any",
                facilities: ["WiFi", "Water", "CCTV"],
                availability: true,
                rating: 4.5,
                contactNumber: "0772223344",
                ownerName: "Thilaga Gamage",
                images: [getImage(4)],
                videos: []
            },
            {
                title: "Gemunu Mawatha Modern Girls Boarding",
                description: "Fully furnished modern single rooms in a safe residential area in Malabe, close to campus.",
                address: "18, Gemunu Mawatha, Malabe",
                distanceFromUniversity: 2.0,
                pricePerMonth: 25000,
                roomType: "Single",
                genderType: "Female",
                facilities: ["WiFi", "AC", "CCTV", "Laundry", "Water"],
                availability: false,
                rating: 5.0,
                contactNumber: "0112677890",
                ownerName: "Nandani Perera",
                images: [getImage(5)],
                videos: []
            },
            {
                title: "Chandrika Kumaratunga Mawatha Annex",
                description: "Budget normal boarding near SLIIT side gate.",
                address: "34/C, Chandrika Kumaratunga Mawatha, Malabe",
                distanceFromUniversity: 1.0,
                pricePerMonth: 7500,
                roomType: "Shared",
                genderType: "Male",
                facilities: ["WiFi", "Water", "Parking"],
                availability: true,
                rating: 4.0,
                contactNumber: "0112910345",
                ownerName: "Priyantha Rupasinghe",
                images: [getImage(6)],
                videos: []
            },
            {
                title: "Arangala Junction Normal Boarding",
                description: "Homely and affordable normal boarding near Arangala Junction, close to Malabe SLIIT.",
                address: "77, Arangala, Malabe",
                distanceFromUniversity: 2.5,
                pricePerMonth: 11000,
                roomType: "Single",
                genderType: "Any",
                facilities: ["WiFi", "Food", "Water", "Laundry"],
                availability: true,
                rating: 4.6,
                contactNumber: "0762224567",
                ownerName: "Malini Disanayake",
                images: [getImage(7)],
                videos: []
            },
            {
                title: "Susilarama Road Boys Hostel",
                description: "Spacious shared normal rooms for male students.",
                address: "12, Susilarama Road, Malabe",
                distanceFromUniversity: 1.8,
                pricePerMonth: 6500,
                roomType: "Shared",
                genderType: "Male",
                facilities: ["Water", "WiFi"],
                availability: true,
                rating: 3.9,
                contactNumber: "0702222345",
                ownerName: "Aruna Wijesinghe",
                images: [getImage(8)],
                videos: []
            },
            {
                title: "Vihara Mawatha Modern Studios",
                description: "Clean and secure modern studio apartments for students.",
                address: "89/A, Vihara Mawatha, Malabe",
                distanceFromUniversity: 1.2,
                pricePerMonth: 28500,
                roomType: "Single",
                genderType: "Female",
                facilities: ["WiFi", "CCTV", "Laundry", "Water", "AC"],
                availability: true,
                rating: 4.7,
                contactNumber: "0711223456",
                ownerName: "Sunethra Jayawardena",
                images: [getImage(9)],
                videos: []
            },
            {
                title: "Pittugala Center Point Hostel",
                description: "Simple normal sharing rooms for boys, right out of the SLIIT campus campus gate.",
                address: "29, Pittugala Junction, Malabe",
                distanceFromUniversity: 0.3,
                pricePerMonth: 7000,
                roomType: "Shared",
                genderType: "Male",
                facilities: ["Food", "Water", "WiFi"],
                availability: false,
                rating: 4.1,
                contactNumber: "0752234567",
                ownerName: "Saman Kumara",
                images: [getImage(10)],
                videos: []
            },
            {
                title: "Horizon Campus & SLIIT Modern Shared Rooms",
                description: "Premium modern shared AC rooms for university students.",
                address: "4/1, IT Park Road, Malabe",
                distanceFromUniversity: 0.8,
                pricePerMonth: 20000,
                roomType: "Shared",
                genderType: "Any",
                facilities: ["WiFi", "AC", "Water", "Parking", "Laundry"],
                availability: true,
                rating: 4.9,
                contactNumber: "0772987654",
                ownerName: "Sampath Senaratne",
                images: [getImage(11)],
                videos: []
            },
            {
                title: "Malabe Bus Stand Normal Budget Rooms",
                description: "Perfect for students needing easy bus access at a cheap price.",
                address: "45, Main Street, Malabe",
                distanceFromUniversity: 2.5,
                pricePerMonth: 6000,
                roomType: "Shared",
                genderType: "Male",
                facilities: ["Water"],
                availability: true,
                rating: 3.8,
                contactNumber: "0112345670",
                ownerName: "Mihira Kumara",
                images: [getImage(12)],
                videos: []
            },
            {
                title: "Modern Girls Annex - Thalahena",
                description: "Located near Thalahena junction, luxurious brand new annex.",
                address: "10, Thalahena Junction, Malabe",
                distanceFromUniversity: 1.8,
                pricePerMonth: 32500,
                roomType: "Single",
                genderType: "Female",
                facilities: ["Food", "Water", "WiFi", "AC"],
                availability: true,
                rating: 4.8,
                contactNumber: "0713456789",
                ownerName: "Kamala Bandara",
                images: [getImage(13)],
                videos: []
            },
            {
                title: "Kahanthota Luxury AC Boys Hostel",
                description: "A large modern house converted into a high-end hostel for students.",
                address: "12, Kahanthota Road, Malabe",
                distanceFromUniversity: 0.6,
                pricePerMonth: 24000,
                roomType: "Shared",
                genderType: "Male",
                facilities: ["Water", "WiFi", "Parking", "AC", "Laundry"],
                availability: true,
                rating: 4.3,
                contactNumber: "0777123456",
                ownerName: "Damith Perera",
                images: [getImage(14)],
                videos: []
            },
            {
                title: "Isurupura Normal Stay",
                description: "Normal budget friendly boarding house with hot water facilities.",
                address: "88, Isurupura, Malabe",
                distanceFromUniversity: 1.5,
                pricePerMonth: 10000,
                roomType: "Single",
                genderType: "Female",
                facilities: ["Water", "WiFi", "Food"],
                availability: true,
                rating: 4.6,
                contactNumber: "0729876543",
                ownerName: "Nayana Weerasinghe",
                images: [getImage(15)],
                videos: []
            },
            {
                title: "Athurugiriya Road Normal SLIIT Boarding",
                description: "Cozy standard rooms with separate entrance.",
                address: "33, Athurugiriya Road, Malabe",
                distanceFromUniversity: 2.2,
                pricePerMonth: 11500,
                roomType: "Single",
                genderType: "Any",
                facilities: ["WiFi", "Water", "Laundry"],
                availability: true,
                rating: 4.8,
                contactNumber: "0766789012",
                ownerName: "Chandana Rajapakse",
                images: [getImage(16)],
                videos: []
            },
            {
                title: "Nevill Fernando Hospital Area Girls Rooms",
                description: "Safe and comfortable standard normal boarding exclusively for female students near hospital and SLIIT.",
                address: "142/B, Weliwita, Malabe",
                distanceFromUniversity: 1.3,
                pricePerMonth: 12000,
                roomType: "Single",
                genderType: "Female",
                facilities: ["WiFi", "Food", "CCTV", "Laundry", "Water"],
                availability: true,
                rating: 4.8,
                contactNumber: "0712205567",
                ownerName: "Menike Rajapaksha",
                images: [getImage(17)],
                videos: []
            },
            {
                title: "Modern Single Rooms Malabe",
                description: "Brand new modern rooms with all luxury amenities.",
                address: "14, Kaduwela Road, Malabe",
                distanceFromUniversity: 1.9,
                pricePerMonth: 35000,
                roomType: "Single",
                genderType: "Male",
                facilities: ["Water", "WiFi", "AC"],
                availability: true,
                rating: 4.5,
                contactNumber: "0788887755",
                ownerName: "Kasun Wimalasiri",
                images: [getImage(18)],
                videos: []
            },
            {
                title: "Pothalawa Budget Normal Student Shared Boarding",
                description: "Only minutes away from SLIIT, cheap standard boarding.",
                address: "Pothalawa, Kahanthota Road, Malabe",
                distanceFromUniversity: 0.7,
                pricePerMonth: 5000,
                roomType: "Shared",
                genderType: "Any",
                facilities: ["WiFi", "Parking", "Water"],
                availability: true,
                rating: 4.0,
                contactNumber: "0770001122",
                ownerName: "Malathie Silva",
                images: [getImage(19)],
                videos: []
            }
        ];

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await Boarding.deleteMany({});
        console.log("🗑️  Cleared existing boardings");

        const finalData = sampleData.map(item => ({
            ...item,
            ownerId: 'seed-owner-12345',
            isApproved: true
        }));
        await Boarding.insertMany(finalData);
        console.log("🎉 20 sample boardings inserted successfully! Local Pexels images generated!");

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedDatabase();
