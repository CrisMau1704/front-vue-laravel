<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Inicio',
        items: [{ label: 'Administrador', icon: 'pi pi-fw pi-home', to: '/admin' }]
    },
    {
        label: 'Gestion productos',
        items: [
            { label: 'Productos', icon: 'pi pi-fw pi-id-card', to: '/admin/producto' },
            { label: 'Categorias', icon: 'pi pi-fw pi-check-square', to: '/admin/categoria' }
            
        ]
    },
    {
        label: 'Usuarios',
        items: [
            { label: 'Usuarios', icon: 'pi pi-fw pi-user', to: '/admin/usuario', badge: 'NEW' },
            { label: 'Clientes', icon: 'pi pi-fw pi-user-plus', to: '/admin/cliente', target: '_blank' }
        ]
    },
    {
        label: 'Gestion Pedidos',
        items: [
            { label: 'Lista pedidos', icon: 'pi pi-fw pi-list', to: '/admin/pedido' },
            { label: 'Nuevo pedido', icon: 'pi pi-fw pi-plus', to: '/admin/pedido/nuevo' },
        ]
    },
    {
        label: 'Configuracion',
        icon: 'pi pi-fw pi-briefcase',
        to: '/config',
        items: [
           
            {
                label: 'Roles y Permisos',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Roles',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/admin/roles'
                    },
                    {
                        label: 'Permisos',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/admin/permisos'
                    }
                   
                ]
            },
           
        ]
    },
    

]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
       
    </ul>
</template>

<style lang="scss" scoped></style>
