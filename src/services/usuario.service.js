import { Api } from "./Api.services";

export default {
    listarUsuarios() {
        return Api().get("/usuario");
    },
    

    guardarUsuario(datos) {  // Añade datos como parámetro aquí
        return Api().post("/usuario", datos);
    },

    mostrarUsuario(id) {
        return Api().get("/usuario/" + id);
    },

    modificarUsuario(id, datos) {  // Añade datos como parámetro aquí
        return Api().put("/usuario/" + id, datos);
    },

    eliminarUsuario(id) {
        return Api().delete("/usuario/" + id);
    },
};
