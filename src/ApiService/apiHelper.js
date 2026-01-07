import api from './api';

export const postRequest = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    console.error('POST error:', error.response || error);
    throw error.response ? error.response.data : error;
  }
};

export const getRequest = async url => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    // console.error('GET error:', error.response || error);
    throw error.response ? error.response.data : error;
  }
};

export const putRequest = async (url, data) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    console.error('PUT error:', error.response || error);
    throw error.response ? error.response.data : error;
  }
};

export const deleteRequest = async url => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    console.error('DELETE error:', error.response || error);
    throw error.response ? error.response.data : error;
  }
};
