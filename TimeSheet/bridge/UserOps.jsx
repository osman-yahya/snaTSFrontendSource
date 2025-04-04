import axios from "./AxiosConfig";

class UserService {

    // Kullanıcı kaydı
    async register(firstName, lastName, username, email, password) {
        try {
            const response = await axios.post("/signup", {
                username: username,
                password: password,
                email: email,
                first_name: firstName,
                last_name: lastName,
            });
            return response.data;  
        } catch (error) {
            throw error; 
        }
    }

    // Kullanıcı girişi
    async login(email, password) {
        try {
            const response = await axios.post("/login", { 
                email: email,
                password: password,
            });
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }

    async refresh() {
        try {
            await axios.post("/refresh", {});
        } catch (error) {
            throw error; 
        }
    }

    async logout() {
        try {
            await axios.post('/signout',{});
            console.log("logged out")
        } catch (error) {
            throw error;
        }
    }

    async getUserinfo() {
        try {
            const response = await axios.post("/users/get" , {});
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }

    async getAllUsers() {
        try {
            const response = await axios.get("/users/getall");
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }

    async toggleUserRole(id) {
        try {
            const response = await axios.post("/users/toggle",{
                id : id
            });
            return response.data; 
        } catch (error) {
            throw error; 
        }
    }
}

export default new UserService();
