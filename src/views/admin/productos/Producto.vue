<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template #start>
        <Button label="Nuevo" icon="pi pi-plus" severity="success" class="mr-2" @click="abrirNuevoProducto" />
        <Button label="Eliminar" icon="pi pi-trash" severity="danger" />
      </template>
      <template #end>
        <FileUpload mode="basic" accept="image/*,application/pdf" :maxFileSize="1000000" label="Importar"
          chooseLabel="Import" class="mr-2 inline-block" />
        <Button label="Exportar" icon="pi pi-upload" severity="help" @click="exportCSV" />
      </template>
    </Toolbar>

    <DataTable ref="dt" :value="productos" dataKey="id" lazy :totalRecords="totalRecords" :loading="loading"
      :paginator="true" :rows="rows" @page="onPage"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[3, 10, 20]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos">
      <template #header>
        <div class="flex align-items-center justify-content-between">
          <h4 class="m-0">Gestión Productos</h4>
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText placeholder="Buscar..." v-model="buscar" @keypress.enter="getProductos" />
          </span>
        </div>
      </template>

      <Column field="id" header="ID" sortable style="min-width:12rem"></Column>
      <Column field="nombre" header="NOMBRE" sortable style="min-width:16rem"></Column>
      <Column field="stock" header="STOCK" sortable style="min-width:16rem"></Column>
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
      <Column field="categoria.nombre" header="Categoria" sortable style="min-width:10rem"></Column>

      <Column :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <Button icon="pi pi-image" outlined rounded class="mr-2" @click="changeImage(slotProps.data)" />
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Toast ref="toast" />

    <!-- Dialog para edición de producto -->
    <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Detalles Producto" :modal="true"
      class="p-fluid">
      <div class="field">
        <label for="name">Nombre</label>
        <InputText id="name" v-model.trim="producto.nombre" required="true" autofocus
          :invalid="submitted && !producto.nombre" />
        <small class="p-error" v-if="submitted && !producto.nombre">Nombre es obligatorio.</small>
      </div>

      <div class="field">
        <label for="description">Descripción</label>
        <Textarea id="description" v-model="producto.descripcion" rows="3" cols="20" />
      </div>

      <div class="field">
        <label for="categoria">Categoría</label>
        <Dropdown id="categoria" v-model="producto.categoria_id" :options="categorias" optionLabel="nombre"
          optionValue="id" placeholder="Seleccione una categoría" class="w-full" />
        <small class="p-error" v-if="submitted && !producto.categoria_id">
          Categoría es obligatoria.
        </small>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label for="price">Precio</label>
          <InputNumber id="price" v-model="producto.precio" mode="currency" currency="USD" locale="en-US" />
        </div>
        <div class="field col">
          <label for="quantity">Cantidad</label>
          <InputNumber id="quantity" v-model="producto.stock" integeronly />
        </div>
      </div>

      <div class="card flex justify-content-center">
        <FileUpload mode="basic" accept="image/*" :auto="true" :customUpload="true" @uploader="customBase64Uploader" />
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" text @click="guardarProducto" />
      </template>
    </Dialog>

    <!-- Dialog para eliminar producto -->
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true" class="p-fluid">
      <p>¿Estás seguro de que deseas eliminar este producto?</p>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="hideDeleteDialog" />
        <Button label="Sí" icon="pi pi-check" text severity="danger" @click="deleteProduct" />
      </template>
    </Dialog>

    <!-- Dialog para cambiar solo la imagen -->
    <Dialog v-model:visible="imageDialog" :style="{ width: '450px' }" header="Cambiar Imagen" :modal="true"
      class="p-fluid">
      <div class="field">
        <label for="image">Imagen</label>
        <FileUpload id="image" mode="basic" accept="image/*" :auto="true" :customUpload="true"
          @upload="customBase64Uploader" />

      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideImageDialog" />
        <Button label="Guardar Imagen" icon="pi pi-check" text @click="guardarImagen" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import productoService from '../../../services/producto.service';
import categoriaService from '../../../services/categoria.service';
import Toast from 'primevue/toast';

import { ref, onMounted } from 'vue';

const productos = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const lazyParams = ref({ page: 0, rows: rows.value });
const buscar = ref('');
const productDialog = ref(false);
const deleteDialog = ref(false);
const imageDialog = ref(false);
const submitted = ref(false);
const producto = ref({
  estado: true,
  categoria_id: null,
  precio: null,
  imagen: null,
});
const fileUploadRef = ref(null);

const toast = ref(null);

const categorias = ref([]);

const newImage = ref(null);

onMounted(() => {
  getProductos();
  getCategorias();
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

const getCategorias = async () => {
  try {
    const { data } = await categoriaService.index();
    categorias.value = data.data.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
    }));
  } catch (error) {
    console.error('Error al obtener categorías:', error);
  }
};

const formatCurrency = (value) => {
  return value
    ? value.toLocaleString('en-US', { style: 'currency', currency: 'BOB' })
    : '';
};

const exportCSV = () => {
  dt.value.exportCSV();
};

const abrirNuevoProducto = () => {
  producto.value = { estado: true, categoria_id: null, precio: null, imagen: null };
  submitted.value = false;
  productDialog.value = true;
};

const hideDialog = () => {
  productDialog.value = false;
  submitted.value = false;
};

const customBase64Uploader = (event) => {
  const file = event.files[0];
  if (file && file.type.startsWith('image/')) {
    newImage.value = file;  // Aquí estamos asignando el archivo correctamente
    producto.value.imagen = file;  // Guarda la imagen seleccionada en producto.value.imagen
    console.log("Imagen seleccionada:", newImage.value);  // Verifica si se asigna correctamente
  } else {
    toast.value.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El archivo no es una imagen válida',
      life: 3000
    });
  }
};




const guardarProducto = async () => {
  try {
    const isNew = !producto.value.id;
    const result = isNew
      ? await productoService.store(producto.value, producto.value.imagen)
      : await productoService.update(producto.value.id, producto.value, producto.value.imagen);

    toast.value.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Producto ${isNew ? 'creado' : 'actualizado'} correctamente`,
      life: 3000,
    });

    productDialog.value = false;
    getProductos();

    if (isNew) {
      producto.value = { estado: true, categoria_id: null, precio: null, imagen: null };
      submitted.value = false;
    }
  } catch (error) {
    toast.value.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar el producto',
      life: 3000,
    });
  }
};


const guardarImagen = async () => {
  try {
    if (newImage.value) {  // Verifica si se ha seleccionado una imagen
      const formData = new FormData();
      formData.append('imagen', newImage.value);  // Agrega el archivo al FormData

      // Llamada a la API para actualizar solo la imagen
      await productoService.updateImage(producto.value.id, formData);

      toast.value.add({
        severity: "success",
        summary: "Éxito",
        detail: "Imagen actualizada correctamente",
        life: 3000
      });

      imageDialog.value = false;  // Cierra el diálogo
      getProductos();  // Actualiza la lista de productos
    } else {
      toast.value.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha seleccionado una imagen',  // Mensaje si no se seleccionó imagen
        life: 3000
      });
    }
  } catch (error) {
    console.error("Error al guardar imagen:", error);
    toast.value.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo actualizar la imagen",
      life: 3000
    });
  }
};








const changeImage = (prod) => {
  producto.value = { ...prod };
  imageDialog.value = true;
};

const hideImageDialog = () => {
  imageDialog.value = false;
};

const editProduct = (prod) => {
  producto.value = { ...prod };
  productDialog.value = true;
};

const onPage = (event) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  getProductos();
};

const deleteProduct = async () => {
  try {
    await productoService.delete(producto.value.id);
    toast.value.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Producto eliminado correctamente',
      life: 3000,
    });
    getProductos();
    hideDeleteDialog();
  } catch (error) {
    toast.value.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el producto',
      life: 3000,
    });
  }
};

const confirmDeleteProduct = (prod) => {
  producto.value = { ...prod };
  deleteDialog.value = true;
};

const hideDeleteDialog = () => {
  deleteDialog.value = false;
};
</script>

<style scoped>
/* Agrega estilos específicos de esta página si los necesitas */
</style>
