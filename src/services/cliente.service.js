import { Api } from "./Api.services";

export default {

     // Paginación
     index(page = 1, limit = 10, q = "") {
        return Api().get(`/cliente?page=${page}&limit=${limit}&q=${q}`);
    },
    
    //store
    guardarUsuario(datos) {  // Añade datos como parámetro aquí
        return Api().post("/cliente", datos);
    },
    //show
    mostrarUsuario(id) {
        return Api().get("/cliente/" + id);
    },
    //update
    modificarUsuario(id, datos) {  // Añade datos como parámetro aquí
        return Api().put("/cliente/" + id, datos);
    },
    //destroy
    eliminarUsuario(id) {
        return Api().delete("/cliente/" + id);
    },

    buscarCliente(q=""){
        return Api().get(`/cliente/buscar-cliente?q=${q}`)
    }
};
