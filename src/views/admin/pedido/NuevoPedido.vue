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
                    <Column field="categoria.nombre" header="Categoría" sortable style="min-width:8rem"></Column>
                    <Column :exportable="false" style="min-width:8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-plus" rounded severity="warning" class="mr-2"
                                @click="addCarrito(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Toast ref="toast" />


        <div class="md:col-5 col-12">
            <div class="grid">
                <div class="col-12">
                    <div class="card">
                        <DataTable :value="carrito">
                            <Column field="nombre" header="Producto"></Column>
                            <Column field="precio" header="Precio"></Column>
                            <Column field="cantidad" header="Cantidad"></Column>
                            <Column :exportable="false">
                                <template #body="slotProps">
                                    <Button icon="pi pi-plus" rounded severity="info" class="mr-2"
                                        @click="aumentarCantidad(slotProps.data)" />
                                    <Button icon="pi pi-minus" rounded severity="warning" class="mr-2"
                                        @click="reducirCantidad(slotProps.data)" />
                                    <Button icon="pi pi-trash" rounded severity="danger" class="mr-2"
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
                            <Button icon="pi pi-plus" rounded severity="danger" class="mr-2" @click="visible = true" />

                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText placeholder="Buscar por CI/NIT..." v-model="buscar_cliente"
                                    @keypress.enter="busquedaCliente" />
                            </span>
                        </div>
                        <br>
                        <div v-if="cliente_seleccionado && cliente_seleccionado.id">
                            <h4>Datos de cliente</h4>
                            <h5>Nombre: {{ cliente_seleccionado.nombre_completo }}</h5>
                            <h5>CI/NIT: {{ cliente_seleccionado.ci_nit }}</h5>
                            <h5>Telefono: {{ cliente_seleccionado.telefono }}</h5>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="p-2 border-round-sm bg-primary font-bold">Carrito</div>
                    <div class="card">
                        <InputText class="mr-2" placeholder="Observaciones..." v-model="observaciones" />
                        <Button label="Registrar pedido" icon="pi pi-check" @click="guardarPedido" />
                    </div>
                </div>

            </div>
        </div>
    </div>

    <Dialog v-model:visible="visible" maximizable modal header="Nuevo cliente" class="p-fluid"
        :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <template #header>
            <div>

            </div>
        </template>
        <div class="field">
            <label for="name">Nombre Completo </label>
            <InputText id="name" v-model.trim="cliente.nombre_completo" required="true" autofocus
                :invalid="submitted && !cliente.nombre_completo" />
            <small class="p-error" v-if="submitted && !cliente.nombre_completo">Nombre es obligatorio.</small>
        </div>
        <div class="field">
            <label for="name">CI/NIT </label>
            <InputText id="ci_nit" v-model.trim="cliente.ci_nit" required="true" autofocus
                :invalid="submitted && !cliente.ci_nit" />
            <small class="p-error" v-if="submitted && !cliente.ci_nit">CI/NIT.</small>
        </div>
        <div class="field">
            <label for="name">Telefono </label>
            <InputText id="tel" v-model.trim="cliente.telefono" autofocus />

        </div>
        <template #footer>
            <Button label="Guardar cliente" icon="pi pi-chek" @click="guardarCliente" autofocus />

        </template>
    </Dialog>


</template>

<script setup>

import clienteService from '../../../services/cliente.service';
import pedidoService from '../../../services/pedidos.service';
import productoService from '../../../services/producto.service';
import Toast from 'primevue/toast';
import { ref, onMounted } from 'vue';

const productos = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const lazyParams = ref({ page: 0, rows: rows.value });
const buscar = ref('');
const buscar_cliente = ref('');
const cliente_seleccionado = ref({});
const carrito = ref([]);
const observaciones = ref('');
const toast = ref(null);
const cliente = ref({});
const visible = ref(false);
const submitted = ref(false);

onMounted(() => {
    getProductos();
});

const getProductos = async () => {
    loading.value = true;
    try {
        const page = lazyParams.value.page + 1;
        const limit = lazyParams.value.rows;
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
    return value ? value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }) : '';
};

const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.rows = event.rows;
    getProductos();
};

const addCarrito = (prod) => {
    const productoExistente = carrito.value.find(p => p.id === prod.id);
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.value.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
    }
};

const quitarCarrito = (prod) => {
    const index = carrito.value.findIndex(p => p.id === prod.id);
    if (index !== -1) carrito.value.splice(index, 1);
};

const aumentarCantidad = (prod) => {
    prod.cantidad = prod.cantidad + 1
};
const reducirCantidad = (prod) => {
    if(prod.cantidad!=1){
        prod.cantidad = prod.cantidad - 1
    }
   
};




const busquedaCliente = async () => {

    const { data } = await clienteService.buscarCliente(buscar_cliente.value);
    cliente_seleccionado.value = data;


};

const guardarPedido = async () => {
    try {
        let pedido = {
            cliente_id: cliente_seleccionado.value.id,
            productos: [],
            observaciones: observaciones.value
        };

        // Agregar productos al pedido
        carrito.value.forEach(prod => {
            pedido.productos.push({ producto_id: prod.id, cantidad: prod.cantidad });
        });

        // Crear una copia plana del pedido para evitar la reactividad
        const pedidoPlana = JSON.parse(JSON.stringify(pedido));

        // Llamada al servicio para guardar el pedido
        const { data } = await pedidoService.store(pedidoPlana);

        // Mostrar un toast de éxito
        toast.value?.add({
            severity: "success",
            summary: "Éxito",
            detail: "Pedido registrado correctamente",
            life: 3000
        });

        // Limpiar el carrito y los datos del cliente
        carrito.value = [];
        cliente_seleccionado.value = {};
        observaciones.value = "";  // Resetear observaciones

    } catch (error) {
        // Mostrar un toast de error
        toast.value?.add({
            severity: "error",
            summary: "Error",
            detail: `Error al registrar el pedido: ${error.response ? error.response.data.message : error.message}`,
            life: 3000
        });
    }
};


const guardarCliente = async () => {
    submitted.value = true;
    if (cliente.value.nombre_completo.trim()) {
        try {

            const { data } = await clienteService.store(cliente.value);
            cliente_seleccionado.value = data;
            toast.value?.add({
                severity: "success",
                summary: "Éxito",
                detail: "Cliente registrado correctamente",
                life: 3000
            });
            cliente.value = [];

        } catch (error) {
            // Mostrar un toast de error
            toast.value?.add({
                severity: "error",
                summary: "Error",
                detail: `Error al registrar al Cliente: ${error.response ? error.response.data.message : error.message}`,
                life: 3000
            });
        }
        visible.value = false
    }



};

</script>
