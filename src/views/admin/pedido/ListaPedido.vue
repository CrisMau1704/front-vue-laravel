<template>
    <DataTable ref="dt" :value="pedidos" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
        :paginator="true" :rows="rows" @page="onPage"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[3, 10, 20]"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pedidos" :exportable="true">

        <template #header>
    <div class="flex align-items-center justify-content-between">
        <h4 class="m-0">Lista Pedidos</h4>
        
        <!-- Usando PrimeVue Calendar para las fechas 
        <Calendar v-model="fi" showTime @change="getPedidos" placeholder="Seleccionar fecha y hora" style="width: 200px;"/>
        <Calendar v-model="ff" showTime @change="getPedidos" placeholder="Seleccionar fecha y hora" style="width: 200px;"/>-->

        <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="getPedidos" />
        </span>
    </div>
</template>


        <Column field="id" header="ID" sortable style="min-width:12rem"></Column>
        <Column field="fecha" header="Fecha" sortable style="min-width:16rem"></Column>
        <Column field="estado" header="Estado" sortable style="min-width:16rem">
            <template #body="slotProps">
                {{ slotProps.data.estado == 2 ? 'COMPLETADO' : 'PENDIENTE' }}
            </template>
        </Column>
        <Column field="cliente.nombre_completo" header="Cliente" sortable style="min-width:10rem"></Column>

        <Column :exportable="false" style="min-width:8rem" header="Acciones" >
            <template #body="slotProps">
                <Button icon="pi pi-file-pdf" rounded severity="danger" class="mr-2"
                    @click="exportPDF(slotProps.data)" />
                <Button icon="pi pi-search" rounded severity="warning" class="mr-2"
                    @click="abrir(slotProps.data)" />
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="pedidotDialog" :style="{ width: '450px' }" header="Detalles Pedido" :modal="true"
        class="p-fluid">
        <h5>Fecha: {{ pedido.fecha }}</h5>
        <h6>Nombre Cliente: {{ pedido.cliente.nombre_completo }}</h6>
        <h6>CI/NIT Cliente: {{ pedido.cliente.ci_nit }}</h6>
        <h6>Teléfono Cliente: {{ pedido.cliente.telefono }}</h6>

        <DataTable :value="pedido.productos" stripedRows tableStyle="min-width: 10rem">
            <Column field="id" header="ID"></Column>
            <Column field="nombre" header="Nombre"></Column>
            <Column field="precio" header="Precio"></Column>
            <Column field="pivot.cantidad" header="Cantidad"></Column>
        </DataTable>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        </template>
    </Dialog>
</template>

<script setup>
import pedidoService from '../../../services/pedido.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ref, onMounted } from 'vue';

const pedidos = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const lazyParams = ref({ page: 0, rows: rows.value });
const buscar = ref('');
const dt = ref(null);

const pedidotDialog = ref(false);
const pedido = ref({});

const fi = ref();
const ff = ref();

onMounted(() => {
    // Llamar a getPedidos sin pasar los filtros (fi, ff, buscar)
    fi.value = null;  // O cualquier valor predeterminado si no quieres filtrar por fecha
    ff.value = null;
    buscar.value = '';
    getPedidos();  // Cargar todos los pedidos al montar la página
});


const getPedidos = async () => {
    loading.value = true;
    const page = lazyParams.value.page + 1;
    const limit = lazyParams.value.rows;

    try {
        const { data } = await pedidoService.index(page, limit, buscar.value);
        console.log('Datos recibidos:', data); // Verifica la respuesta
        pedidos.value = data.data;
        totalRecords.value = data.total;

        // Verificar si los datos se asignan correctamente
        if (pedidos.value.length > 0) {
            console.log('Pedidos cargados:', pedidos.value);
        } else {
            console.log('No hay pedidos disponibles.');
        }

       
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.page = event.page;
    lazyParams.value.rows = event.rows;
    getPedidos();
};

const exportPDF = (pedidoData) => {
    if (!pedidoData || !pedidoData.productos) {
        console.error("No hay datos de productos disponibles para exportar.");
        return;
    }

    const doc = new jsPDF();

    // Título de la factura
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('FACTURA DE VENTA', 105, 20, null, null, 'center');
    doc.setFontSize(12);

    // Información de la empresa
    doc.setFont('Helvetica', 'normal');
    doc.text('Digital File', 14, 30);
    doc.text('NIT: 123456789', 14, 35);
    doc.text('Dirección: Calle Ficticia 123, La Paz, Bolivia', 14, 40);
    doc.text('Teléfono: 123-456789', 14, 45);

    // Número de Factura, Autorización y Código de Control alineados a la derecha
    doc.text('Nro. Factura: 001-00123456', 120, 30);
    doc.text('Nro. Autorización: 12345678901234', 120, 35);

    // Información del cliente y del pedido
    doc.text(`Producto: ${pedidoData.cliente.nombre_completo}`, 14, 55);
    doc.text(`CI/NIT: ${pedidoData.cliente.ci_nit}`, 14, 60);
    doc.text(`Fecha: ${pedidoData.fecha}`, 14, 65);
    doc.text(`ID Pedido: ${pedidoData.id}`, 14, 70);

    // Separador
    doc.setLineWidth(0.5);
    doc.line(14, 75, 200, 75);

    // Títulos de la tabla de productos
    const columns = ['ID', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'];
    const rows = pedidoData.productos.map(prod => [
        prod.id,
        prod.nombre,
        prod.pivot.cantidad,
        `${prod.precio} Bs`,
        `${prod.pivot.cantidad * prod.precio} Bs`
    ]);

    // Insertar la tabla con los productos
    autoTable(doc, {
        startY: 80,
        head: [columns],
        body: rows,
        theme: 'grid',
        headStyles: { 
            fillColor: [0, 128, 0], // Verde
            textColor: [255, 255, 255], // Blanco
            fontSize: 10, 
            fontStyle: 'bold' 
        },
        bodyStyles: { fontSize: 10, textColor: [0, 0, 0] }
    });

    // Calcular el total
    const total = pedidoData.productos.reduce((sum, prod) => sum + (prod.pivot.cantidad * prod.precio), 0);
    doc.text(`Total: ${total} Bs`, 14, doc.lastAutoTable.finalY + 10);

    // Convertir el total a literal
    const totalLiteral = numberToWords(total);

    // Mostrar total en literal
    doc.text(`Total en Literal: ${totalLiteral}`, 14, doc.lastAutoTable.finalY + 20);

    // Añadir un pie de página con los términos o algún mensaje
    doc.setFontSize(8);
    doc.text('Gracias por su compra. Términos y condiciones aplican.', 105, doc.lastAutoTable.finalY + 30, null, null, 'center');

    // Guardar el documento
    doc.save(`factura_${pedidoData.id}.pdf`);
};

// Función para convertir número a literal
function numberToWords(number) {
    const ones = [
        '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
        'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'
    ];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const thousands = ['', 'mil', 'millón', 'mil millones'];

    let numStr = number.toString();
    let result = '';
    let i = 0;

    while (numStr.length > 0) {
        const chunk = numStr.slice(-3);
        numStr = numStr.slice(0, -3);

        let chunkStr = '';
        let chunkNum = parseInt(chunk, 10);

        if (chunkNum >= 100) {
            chunkStr += `${ones[Math.floor(chunkNum / 100)]} ciento `;
            chunkNum %= 100;
        }

        if (chunkNum >= 20) {
            chunkStr += `${tens[Math.floor(chunkNum / 10)]} `;
            chunkNum %= 10;
        }

        chunkStr += ones[chunkNum];

        result = chunkStr + (i > 0 ? ' ' + thousands[i] : '') + ' ' + result;
        i++;
    }

    return result.trim();
}

const abrir = (pedi) => {
    pedido.value = pedi;
    pedidotDialog.value = true;
};

const hideDialog = () => {
    pedidotDialog.value = false;
};
</script>
