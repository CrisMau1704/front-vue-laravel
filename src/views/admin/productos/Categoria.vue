<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="abrirNuevoCategoria" />
      </template>
      <template #end>
        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Importar" chooseLabel="Import"
          class="mr-2 inline-block" />
        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
      </template>
    </Toolbar>

    <DataTable ref="dt" :value="categorias" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
      :paginator="true" :rows="rows" @page="onPage"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[3, 10, 20]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos">
      <template #header>
        <div class="flex align-items-center justify-content-between">
          <h4 class="m-0">Gestión Categorías</h4>
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="getListaCategorias" />
          </span>
        </div>
      </template>

      <Column field="id" header="ID" sortable style="min-width:12rem"></Column>
      <Column field="nombre" header="NOMBRE" sortable style="min-width:16rem"></Column>
      <Column field="detalle" header="DETALLE" sortable style="min-width:16rem"></Column>

      <Column :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCategoria(slotProps.data)" />
         
        </template>
      </Column>
    </DataTable>

    <!-- Contenedor para Toast -->
    <Toast ref="toast" />

    <!-- Dialog para detalles de la categoría -->
    <Dialog v-model:visible="CategoriaDialog" :style="{ width: '450px' }" header="Detalle Categoria" :modal="true"
      class="p-fluid">
      <div class="field">
        <label for="name">Nombre</label>
        <InputText id="name" v-model.trim="categoria.nombre" required="true" autofocus
          :invalid="submitted && !categoria.nombre" />
        <small class="p-error" v-if="submitted && !categoria.nombre">Nombre es obligatorio.</small>
      </div>

      <div class="field">
        <label for="description">Detalle</label>
        <Textarea id="description" v-model="categoria.detalle" rows="3" cols="20" />
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog()" />
        <Button label="Guardar" icon="pi pi-check" text @click="guardarCategoria()" />
      </template>
    </Dialog>

    <!-- Dialog para nueva categoría -->
    <Dialog v-model:visible="visible" maximizable modal header="Nueva categoria" :style="{ width: '50rem' }"
      class="p-fluid" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <div class="field">
        <label for="">Ingrese nombre</label>
        <InputText v-model.trim="categoria.nombre" required="true" autofocus />
      </div>

      <div class="field">
        <label for="det">Ingrese detalle</label>
        <Textarea v-model="categoria.detalle" required="true" rows="3" cols="20" />
      </div>

      <template #footer>
        <Button :label="categoria.id ? 'Editar Categoria' : 'Guardar Categoria'" @click="guardarCategoria()" />
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import categoriaService from '../../../services/categoria.service';
import { ref, onMounted } from 'vue';
import Toast from 'primevue/toast'; // Importa el componente Toast

const categorias = ref([]);
const categoria = ref({
  nombre: "",
  detalle: ""
});

const totalRecords = ref(0);
const rows = ref(10); // Número de filas por página
const loading = ref(false);
const lazyParams = ref({ page: 0, rows: rows.value });
const buscar = ref("");

const visible = ref(false);
const submitted = ref(false);
const CategoriaDialog = ref(false);

// Referencia al componente Toast
const toast = ref(null);

onMounted(() => {
  getListaCategorias();
});

const getListaCategorias = async () => {
  loading.value = true;
  const page = lazyParams.value.page + 1;  // Se suma 1 porque el backend suele usar paginación 1-indexada
  const limit = lazyParams.value.rows;     // Número de filas por página

  try {
    // Llamar al servicio de categorías con la paginación y búsqueda
    const { data } = await categoriaService.index(page, limit, buscar.value);

    // Asignar directamente los datos a categorias sin filtrar
    categorias.value = data.data;

    // Asignar el total de registros para la paginación
    totalRecords.value = data.total;

  } catch (error) {
    console.error("Error al obtener las categorías:", error);
  } finally {
    loading.value = false;
  }
};

async function guardarCategoria() {
  try {
    if (categoria.value.id) {
      // Actualizar categoría existente
      await categoriaService.update(categoria.value.id, categoria.value);
    } else {
      // Crear nueva categoría
      await categoriaService.store(categoria.value);
    }

    // Obtener la lista actualizada de categorías
    await getListaCategorias();

    // Mostrar el mensaje de éxito usando Toast
    toast.value.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría guardada correctamente!', life: 3000 });

    // Cerrar el diálogo de categoría
    CategoriaDialog.value = false;

    // Resetear el formulario
    categoria.value = { nombre: "", detalle: "" };

  } catch (error) {
    // Si hay error, mostrar un mensaje de error
    toast.value.add({ severity: 'error', summary: 'Error', detail: 'Ya existe una categoria con ese nombre', life: 3000 });
    console.error("Error al guardar categoría:", error);
  }
}

const hideDialog = () => {
  CategoriaDialog.value = false;
  submitted.value = false;
};

const abrirNuevoCategoria = () => {
  CategoriaDialog.value = true;
  submitted.value = false;
};

const onPage = (event) => {
  lazyParams.value.page = event.page; // Actualizar la página
  lazyParams.value.rows = event.rows;  // Actualizar el número de filas

  // Llamar a la API para obtener nuevas categorías con los parámetros actualizados
  getListaCategorias();  // Llamar a la función correcta
};

// Abrir diálogo para editar categoría
const editCategoria = (selectedCategoria) => {
  categoria.value = { ...selectedCategoria };
  CategoriaDialog.value = true;  // Corregido para usar la variable correcta
};



</script>
