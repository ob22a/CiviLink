/**
 * Applications API client
 * 
 * Handles application-related operations:
 * - Get all user applications
 * - Download certificate
 */

import { apiRequest } from '../utils/api.js';
import { API_BASE_URL_DEV } from '../config/backend.js';

/**
 * Get all applications for the current user
 * @returns {Promise<Object>} List of applications
 */
export const getAllApplications = async (page = 1, limit = 10) => {
  return apiRequest(`/applications?page=${page}&limit=${limit}`, {
    method: "GET",
  });
};

/**
 * Get application by ID
 * @param {string} id - Application ID
 * @returns {Promise<Object>} Application details
 */
export const getApplicationById = async (id) => {
  // Try endpoint that fetches specific app
  return apiRequest(`/applications/${id}`, {
    method: "GET",
  });
};

/**
 * Submit a TIN application
 * @param {Object} formData - TIN form data
 * @returns {Promise<Object>} Application info
 */
export const submitTinApplication = async (formData) => {
  // Transform flat formData to nested structure matching backend validator
  const transformedData = {
    personal: {
      firstName: formData.firstName,
      middleName: formData.middleName || '',
      lastName: formData.lastName,
      dateOfBirth: formData.dob ? new Date(formData.dob).toLocaleDateString('en-GB') : '', // Format: DD/MM/YYYY
      gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1), // Capitalize first letter
      bankAccountNumber: '1234567890', // Constant - not collected in UI
      FAN: '12345678', // Constant - not collected in UI
      email: 'placeholder@email.com' // Constant - not collected in UI
    },
    employmentDetails: {
      occupation: formData.occupation,
      employerName: formData.employerName || '',
      employerAddress: formData.employerAddress || ''
    },
    addressDetails: {
      streetAddress: formData.streetAddress,
      city: formData.city,
      region: formData.region,
      postalCode: formData.postalCode ? parseInt(formData.postalCode) : undefined
    },
    subcity: "Yeka" // Constant - not collected in UI
  };

  return apiRequest('/tin/applications', {
    method: 'POST',
    body: JSON.stringify({ formData: transformedData }),
  });
};

/**
 * Submit a vital application (birth/marriage/etc)
 * @param {string} type - type of vital record
 * @param {Object} formData - vital form data
 * @returns {Promise<Object>} Application info
 */
export const submitVitalApplication = async (type, formData) => {
  let transformedData = {};

  if (type === 'birth') {
    transformedData = {
      birth: {
        child: {
          firstName: formData.childFirstName,
          middleName: formData.childMiddleName || '',
          lastName: formData.childLastName,
          gender: formData.childGender.charAt(0).toUpperCase() + formData.childGender.slice(1), // Male/Female
          date: formData.childDOB ? new Date(formData.childDOB).toLocaleDateString('en-GB') : '', // DD/MM/YYYY
          time: formData.childTimeOfBirth || '00:00',
          place: formData.placeOfBirth
        },
        mother: {
          firstName: formData.motherFirstName,
          lastName: formData.motherLastName,
          date: formData.motherDOB ? new Date(formData.motherDOB).toLocaleDateString('en-GB') : '01/01/1990',
          nationality: formData.motherNationality || 'Ethiopian',
          occupation: formData.motherOccupation || ''
        },
        father: {
          firstName: formData.fatherFirstName,
          lastName: formData.fatherLastName,
          date: formData.fatherDOB ? new Date(formData.fatherDOB).toLocaleDateString('en-GB') : '01/01/1990',
          nationality: formData.fatherNationality || 'Ethiopian',
          occupation: formData.fatherOccupation || ''
        },
        medicalFacility: {
          facilityName: formData.facilityName,
          attendingPhysician: formData.attendingPhysician || '',
          address: formData.facilityAddress
        }
      },
      subcity: "Yeka"
    };
  } else if (type === 'marriage') {
    transformedData = {
      marriage: {
        husband: {
          applicantInformation: {
            fullName: formData.groomName,
            dateOfBirth: formData.groomDOB ? new Date(formData.groomDOB).toLocaleDateString('en-GB') : '01/01/1980',
            placeOfBirth: formData.groomAddress || 'Addis Ababa',
            nationality: formData.groomNationality || 'Ethiopian',
            address: formData.groomAddress || 'Addis Ababa',
            phoneNumber: '0911223344',
            emailAddress: 'groom@example.com'
          },
          witnessInformation: [
            {
              fullName: formData.witness1Name || 'Witness One',
              relationship: formData.witness1Relationship || 'Friend',
              contactNumber: '0900112233',
              address: 'Addis Ababa'
            }
          ]
        },
        wife: {
          applicantInformation: {
            fullName: formData.brideName,
            dateOfBirth: formData.brideDOB ? new Date(formData.brideDOB).toLocaleDateString('en-GB') : '01/01/1985',
            placeOfBirth: formData.brideAddress || 'Addis Ababa',
            nationality: formData.brideNationality || 'Ethiopian',
            address: formData.brideAddress || 'Addis Ababa',
            phoneNumber: '0922334455',
            emailAddress: 'bride@example.com'
          },
          witnessInformation: [
            {
              fullName: formData.witness2Name || 'Witness Two',
              relationship: formData.witness2Relationship || 'Friend',
              contactNumber: '0911002233',
              address: 'Addis Ababa'
            }
          ]
        },
        ceremonyDetails: {
          date: formData.marriageDate ? new Date(formData.marriageDate).toLocaleDateString('en-GB') : '01/01/2024',
          time: '10:00',
          place: formData.marriageLocation || 'Addis Ababa',
          officiant: 'City Official'
        }
      },
      subcity: "Yeka"
    };
  }

  return apiRequest(`/vital/${type}/applications`, {
    method: 'POST',
    body: JSON.stringify({ formData: transformedData }),
  });
};

/**
 * Finalize a vital application after payment
 * @param {string} type - type of vital record
 * @param {string} id - Application ID
 * @returns {Promise<Object>} Finalized application info
 */
export const finalizeVitalApplication = async (type, id) => {
  return apiRequest(`/vital/${type}/applications/${id}/finalize`, {
    method: 'POST',
  });
};

/**
 * Finalize a TIN application after payment
 * @param {string} id - Application ID
 * @returns {Promise<Object>} Finalized application info
 */
export const finalizeTinApplication = async (id) => {
  return apiRequest(`/tin/applications/${id}/finalize`, {
    method: 'POST',
  });
};

/**
 * Download a certificate
 * @param {string} applicationId - Application ID
 */
export const downloadCertificate = async (applicationId) => {
  const url = `${API_BASE_URL_DEV}/applications/${applicationId}/download`;
  
  window.location.href = url;
};

