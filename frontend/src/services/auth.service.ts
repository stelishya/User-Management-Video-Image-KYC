
import api from '../api/api';

export const signup = async (userData: {name:string,email:string,password:string}) => {
    const response = await api.post('/auth/signup', userData);
    console.log("signup response",response.data);
    return response.data;
};

export const login = async (userData: {email:string,password:string}) => {
    const response = await api.post('/auth/login', userData);
    console.log("login response",response.data);
    return response.data;
};
