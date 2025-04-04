import axios from "./AxiosConfig";

class WorkService {

    // date in formay YYYY-MM-DD
    async create(company, about, workhour, date) {
        try {
            const response = await axios.post("/work/create", {
                company:company,
                about:about,
                work_hour:workhour,
                date:date
            });
            return response.data;  
        } catch (error) {
            throw error; 
        }
    }

    // specify works id
    async delete(deleteid) {
        try {
            const response = await axios.post("/work/delete", { 
                id:deleteid
            });
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }

    async deleteAsManager(deleteid) {
        try {
            const response = await axios.post("/work/forcedelete", { 
                id:deleteid
            });
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }

    async getWorks() {
        try {
            const response = await axios.get("/work/get");
            return response.data
        } catch (error) {
            throw error; 
        }
    }

    async getAllWorksAsManager(user, company, date) {
        try {
            const response = await axios.post("/work/getall", { 
                wanted_user: user || "",    
                wanted_company: company || "", 
                wanted_date: date || "", 
            });
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }
    
}

export default new WorkService();
