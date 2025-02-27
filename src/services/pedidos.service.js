import { Api } from "./Api.services";

export default {

     // Paginación
    index(page = 1, limit = 10, q = "") {
        return Api().get(`/pedido?page=${page}&limit=${limit}&q=${q}`);
    },
    
    //store
    store(datos) {  // Añade datos como parámetro aquí
        return Api().post("/pedido", datos);
    },
    //show
    show(id) {
        return Api().get("/pedido/" + id);
    },
    //update
    update(id, datos) {  // Añade datos como parámetro aquí
        return Api().put("/pedido/" + id, datos);
    },
    
};
