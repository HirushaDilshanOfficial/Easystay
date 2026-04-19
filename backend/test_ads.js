const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://admin:admin123@cluster0.dbwuo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    const Advertisement = require('./models/AdvertisementModel');
    const ads = await Advertisement.find({});
    console.log("Total Ads:", ads.length);
    const approved = ads.filter(a => a.status === 'approved');
    console.log("Approved Ads:", approved.length);
    console.log("Statuses:", [...new Set(ads.map(a => a.status))]);
    process.exit(0);
  });
