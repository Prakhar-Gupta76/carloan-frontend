import { apiClient } from './client';

export async function generateOTP(mobileNumber) {
  const response = await apiClient.post('/api/v1/generateOTP', {
    mobile_number: mobileNumber
  });

  return response.data;
}

export async function verifyOTP(mobileNumber, otp) {
  const response = await apiClient.post('/api/v1/verifyOTP', {
    mobile_number: mobileNumber,
    otp: Number(otp)
  });

  return response.data;
}

export async function getUser(mobileNumber) {
  const response = await apiClient.post('/api/v1/user', {
    mobile_number: mobileNumber
  });

  return response.data;
}

export async function saveUser(payload) {
  const response = await apiClient.post('/api/v1/saveUser', payload);

  return response.data;
}

export async function saveDrivingLicense(payload) {
  const response = await apiClient.post('/api/v1/saveDrivingLicense', payload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

export async function getQuotes(payload) {
  const response = await apiClient.post('/api/v1/getQuotes', payload);

  return response.data;
}

export async function verifyDetails(mobileNumber) {
  await apiClient.post('/api/v1/verifyDetails', {
    mobile_number: mobileNumber
  });
}

export async function verifyDOB({ mobileNumber, documentType, documentFile }) {
  const formData = new FormData();

  formData.append('mobile_number', mobileNumber);
  formData.append('document_type', documentType);
  formData.append('document_file', documentFile);

  const response = await apiClient.post('/api/v1/verifyDOB', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
}

export async function pay(payload) {
  const response = await apiClient.post('/api/v1/pay', payload);

  return response.data;
}
