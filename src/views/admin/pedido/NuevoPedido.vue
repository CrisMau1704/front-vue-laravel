<template>
    <h1>Nuevo pedido</h1>
    <div class="grid">
        <div class="md:col-7 col-12">

            <div class="card">
                <h5>Lista de Productos</h5>
                <DataTable ref="dt" :value="productos" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
                    :paginator="true" :rows="rows" @page="onPage"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[3, 10, 20]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos">


                    <template #header>
                        <div class="flex align-items-center justify-content-between">
                            <h4 class="m-0">Productos</h4>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search"></i>
                                <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="getProductos" />
                            </span>
                        </div>
                    </template>


                    <Column field="nombre" header="NOMBRE" sortable style="min-width:16rem"></Column>
                    <Column field="stock" header="STOCK" sortable style="min-width:12rem"></Column>
                    <Column header="Imagen">
                        <template #body="slotProps">
                            <img :src="`http://127.0.0.1:8000/storage/${slotProps.data.imagen}`" alt="Imagen"
                                style="width: 50px; height: 50px;" />
                        </template>
                    </Column>

                    <Column field="precio" header="Precio" sortable style="min-width:8rem">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.precio) }}
                        </template>
                    </Column>
                    <Column field="categoria.nombre" header="Categoria" sortable style="min-width:8rem"></Column>

                    <Column :exportable="false" style="min-width:8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-plus" rounded severity="warning" class="mr-2"
                                @click="addCarrito(slotProps.data)" />

                        </template>
                    </Column>
                </DataTable>
            </div>

        </div>
        <div class="md:col-5 col-12">
            <div class="grid">
                <div class="col-12">
                    <div class="card">
                        <DataTable :value="carrito">
                            <Column field="nombre" header="Producto"></Column>
                            <Column field="precio" header="Precio"></Column>
                            <Column field="cantidad" header="Cantidad"></Column>
                            <Column field="acciones" header="Gestion"></Column>
                            <Column :exportable="false">
                                <template #body="slotProps">
                                    <Button icon="pi pi-plus" rounded severity="danger" class="mr-2"
                                        @click="quitarCarrito(slotProps.data)" />

                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>

                <div class="col-12">
                    <div class="card">
                        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                            <h4 class="m-0">Cliente</h4>
                            <Button label="Buscar" icon="pi pi-search" iconPos="right" @click="busquedaCliente()" />

                            <span class="p-input-icon-left">
                                <InputText placeholder="Buscar..." v-model="buscar_cliente"
                                    @keypress.enter="busquedaCliente()" />
                            </span>
                        </div>
                        <div v-if="Object.keys(cliente_seleccionado).length > 0">
                            <h5>Datos cliente</h5>
                            <p><strong>Nombre:</strong> {{ cliente_seleccionado.nombre }}</p>
                            <p><strong>Teléfono:</strong> {{ cliente_seleccionado.telefono }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="p-2 border-round-sm bg-primary font-bold ">Carrito</div>
                    <div class="card">
                        <InputText class="mr-2" placeholder="Observaciones" v-model="buscar"
                            @keypress.enter="getProductos()" />
                        <Button label="Registrar pedido" icon="pi pi-check" iconPos="right" />

                    </div>
                </div>
            </div>

        </div>

    </div>
</template>
<script setup>
import clienteService from '../../../services/cliente.service';
import productoService from '../../../services/producto.service';

import { ref, onMounted } from 'vue';

const productos = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const lazyParams = ref({ page: 0, rows: rows.value });
const buscar = ref('');
const productDialog = ref(false);
const cliente_seleccionado = ref({}); // Almacena el cliente encontrado

const buscar_cliente = ref('');

const carrito = ref([]);


onMounted(() => {
    getProductos();

});

const getProductos = async () => {
    loading.value = true;
    const page = lazyParams.value.page + 1;
    const limit = lazyParams.value.rows;

    try {
        const { data } = await productoService.index(page, limit, buscar.value);
        productos.value = data.data;
        totalRecords.value = data.total;
    } catch (error) {
        console.error('Error al obtener productos:', error);
    } finally {
        loading.value = false;
    }
};


const formatCurrency = (value) => {
    return value
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'BOB' })
        : '';
};

const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.rows = event.rows;
    getProductos();
};

const addCarrito = (prod) => {
    const producto = { id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 }
    carrito.value.push(producto)
}
const quitarCarrito = (prod) => {
    carrito.value.splice(carrito.value.indexOf(prod), 1);//indexOf sirve para quitar un pedido una fila
}


const busquedaCliente = async () => {
    const { data } = await clienteService.buscarCliente(buscar_cliente.value)
    cliente_seleccionado.value = data

}
</script>
