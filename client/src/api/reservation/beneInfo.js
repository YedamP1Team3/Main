import axios from 'axios';

export const getBeneficiariesByFamilyId = async () => {
    const response = await axios.get('/reserve/beneficiaries');
    return response.data;
};