import { Api } from "./Api.services";

export default {

     // Paginación
     index(page = 1, limit = 10, q = "") {
        return Api().get(`/producto?page=${page}&limit=${limit}&q=${q}`);
    },
    
    //store
    store(datos, imagen) {
        const formData = new FormData();

        // Agregar los datos del producto al FormData
        Object.keys(datos).forEach(key => {
            if (datos[key]) {
                formData.append(key, datos[key]);
            } else {
                console.error(`El campo ${key} es obligatorio.`);
                throw new Error(`El campo ${key} es obligatorio.`);
            }
        });

        // Verificar si se envió una imagen
        if (imagen) {
            formData.append("imagen", imagen);
        } else {
            formData.append("imagen", null);
        }

        // Enviar los datos al servidor
        return Api().post("/producto", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then(response => {
            console.log('Producto creado correctamente:', response);
            return response;
        })
        .catch(error => {
            console.error('Error al crear el producto:', error);
            throw error;
        });
    },

    // Obtener un producto específico por ID
    show(id) {
        if (!id) throw new Error("El ID es requerido");
        return Api().get(`/producto/${id}`);
    },
    //show
    show(id) {
        return Api().get("/producto/" + id);
    },
    //update
    update(id, datos) {  // Añade datos como parámetro aquí
        return Api().put("/producto/" + id, datos);
    },
    //destroy
    destroy(id) {
        return Api().delete("/producto/" + id);
    },

    buscarproducto(q=""){
        return Api().get(`/producto/buscar-producto?q=${q}`)
    }
};
