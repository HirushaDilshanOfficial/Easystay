const SLIIT_EMAIL_DOMAIN = '@my.sliit.lk';

/**
 * Validates Student signup input.
 */
const validateStudentSignup = ({ name, email, password }) => {
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters.');
    }

    if (!email) {
        errors.push('Email is required.');
    } else if (!email.toLowerCase().endsWith(SLIIT_EMAIL_DOMAIN)) {
        errors.push(`Student email must be a valid SLIIT email (example: IT23678734${SLIIT_EMAIL_DOMAIN}).`);
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }

    return errors;
};

/**
 * Validates BoardingOwner signup input.
 */
const validateBoardingOwnerSignup = ({ name, email, password, phoneNumber, address }, files) => {
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('A valid email address is required.');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        errors.push('A valid 10-digit phone number is required.');
    }

    if (!address || address.trim().length < 5) {
        errors.push('Address must be at least 5 characters.');
    }

    if (!files || !files.nicPhoto || files.nicPhoto.length === 0) {
        errors.push('NIC photo is required.');
    }

    if (!files || !files.facePhoto || files.facePhoto.length === 0) {
        errors.push('Face photo is required.');
    }

    if (!files || !files.boardingDocuments || files.boardingDocuments.length === 0) {
        errors.push('At least one boarding document is required.');
    }

    return errors;
};

module.exports = { validateStudentSignup, validateBoardingOwnerSignup };
