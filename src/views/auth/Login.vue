<template>
  <!--
    <h1>Ingresar</h1>
    {{ credenciales }}
    <br>
    <label for="c">Ingrese su correo:</label>
    <input type="email" id="c" v-model="credenciales.email">
    {{ errors.email }}
    <br>
    <label for="p">Ingrese su contraseña:</label>
    <input type="password" id="p" v-model="credenciales.password">
    {{ errors.password }}
    <br>
    <button type="button" @click="funIngresar()">Ingresar</button>
-->
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="../../../public/demo/images/logo-digitalfile.PNG" alt="Image" height="120" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Bienvenido</div>
                        <span class="text-600 font-medium">Cambio de Cristian </span>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Correo electronico</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="credenciales.email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password id="password1" v-model="credenciales.password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputStyle="padding:1rem"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Forgot password?</a>
                        </div>
                        <Button label="Ingresar" class="w-full p-3 text-xl" @click="funIngresar()"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />

  </template>
  


  <script setup>
  import { ref } from 'vue';
  import authService from '../../services/auth.service';
  import { useRouter } from "vue-router";
  
  const credenciales = ref({ email: "", password: "" });
  const errors = ref({});
  const router = useRouter();
  
  async function funIngresar() {
    if (!credenciales.value.email || !credenciales.value.password) {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    try {
      const { data } = await authService.login(credenciales.value);
      console.log("Respuesta del servidor:", data); // Verifica el contenido de la respuesta
  
      localStorage.setItem("access_token", data.access_token);
      console.log("Token guardado:", localStorage.getItem("access_token"));
  
      router.push("/admin/categoria");
    } catch (error) {
      console.log("Error:", error);
      if (error.response) {
        if (error.response.status === 422) {
          errors.value = error.response.data.errors || {};
        } else {
          alert(`Error: ${error.response.data.message || "Credenciales incorrectas"}`);
        }
      } else {
        alert("Error de conexión al servidor.");
      }
    }
  }
  </script>
  