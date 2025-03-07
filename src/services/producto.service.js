import { Api } from "./Api.services";
import axios from "axios";

export default {
    // Paginación
    index(page = 1, limit = 10, q = "") {
        return Api().get(`/producto?page=${page}&limit=${limit}&q=${q}`);
    },

    // Crear un nuevo producto
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
            // Si 'imagen' es un archivo, se agrega
            formData.append("imagen", imagen);
        } else {
            // Si no se envió imagen, se agrega un valor null
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

    // Actualizar un producto existente
    update(id, datos, imagen) {
        if (!id) throw new Error("El ID es requerido");

        // Validar que los campos obligatorios estén completos
        if (!datos.nombre || !datos.stock || !datos.precio) {
            console.error("Los campos 'nombre', 'stock' y 'precio' son obligatorios.");
            return Promise.reject(new Error("Los campos 'nombre', 'stock' y 'precio' son obligatorios."));
        }

        const formData = new FormData();

        // Agregar los datos del producto al FormData
        Object.keys(datos).forEach(key => {
            if (datos[key]) {
                formData.append(key, datos[key]);
            }
        });

        // Si hay una imagen nueva, se agrega
        if (imagen) {
            formData.append("imagen", imagen);
        }

        // Realizar la solicitud PUT con los datos
        return Api().put(`/producto/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(response => {
            console.log('Producto actualizado correctamente:', response);
            return response;
        })
        .catch(error => {
            console.error('Error al actualizar el producto:', error);
            throw error;
        });
    },

    // Eliminar un producto por ID
    destroy(id) {
        if (!id) throw new Error("El ID es requerido");
        return Api().delete(`/producto/${id}`);
    },
};
