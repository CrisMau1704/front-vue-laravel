<template>
    <div>
        <h1>Lista usuarios</h1>
        <label for="">Nombre:</label>
        <input type="text" v-model="usuario.name"><br>
        <label for="">email:</label>
        <input type="text" v-model="usuario.email"><br>
        <label for="">password:</label>
        <input type="text" v-model="usuario.password"><br>
        <button @click="guardar">guardar usuario</button>

        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>CORREO</th>
                    <th>ACCION</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="usuario in usuarios" :key="usuario.id">
                    <td>{{ usuario.id }}</td>
                    <td>{{ usuario.name }}</td>
                    <td>{{ usuario.email }}</td>
                    <td>
                        <button @click="editarUsuario(usuario)">editar</button>
                        <button @click="eliminarUsuario(usuario.id)">eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref } from 'vue';  // Importar ref desde Vue
import usuarioService from "./../../services/usuario.service";

const usuarios = ref([]); 
const usuario = ref({
    name: '',
    email: '',
    password: ''
});

async function listarUsuarios() {
    try {
        const { data } = await usuarioService.listarUsuarios();
        usuarios.value = data;
    } catch (error) {
        console.error('Error al listar usuarios:', error);
    }
}

listarUsuarios();

async function guardar() {
    try {
        if (usuario.value.id) {
            await usuarioService.modificarUsuario(usuario.value.id, usuario.value);
        } else {
            await usuarioService.guardarUsuario(usuario.value);
        }
        listarUsuarios();  // Actualizar la lista después de guardar
        usuario.value = { name: '', email: '', password: '' };  // Limpiar el formulario
    } catch (error) {
        console.error('Error al guardar usuario:', error);
    }
}

function editarUsuario(usuarioEditar) {
    usuario.value = { ...usuarioEditar };  // Copiar los datos del usuario a editar a usuario.value
}

async function eliminarUsuario(id) {
    try {
        await usuarioService.eliminarUsuario(id);
        listarUsuarios();  // Actualizar la lista después de eliminar
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
    }
}
</script>