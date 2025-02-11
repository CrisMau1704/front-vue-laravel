import { Api } from "./Api.services";

export default {
    index(page = 1, limit = 10, q = "") {
        return Api().get(`/categoria?page=${page}&limit=${limit}&q=${q}`);
    },
    

    store(datos) {  // Añade datos como parámetro aquí
        return Api().post("/categoria", datos);
    },

    show(id) {
        return Api().get('/categoria/"${id}');
    },

    update(id, datos) {  // Añade datos como parámetro aquí
        return Api().put("/categoria/" + id, datos);
    },

    destroy(id) {
        return Api().delete("/categoria/" + id);
    },
};
