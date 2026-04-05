import axios from 'axios';

const API_URL = 'http://localhost:5000/api/contact/';

const submitContactForm = async (contactData) => {
    const response = await axios.post(API_URL, contactData);
    return response.data;
};

const contactService = {
    submitContactForm
};

export default contactService;
