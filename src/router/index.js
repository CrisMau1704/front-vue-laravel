import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Usuario from '@/views/admin/Usuario.vue'
import Cliente from '@/views/admin/Cliente.vue'
import Login from '../views/auth/Login.vue'
import Categoria from '../views/admin/productos/Categoria.vue'
import Producto from '../views/admin/productos/Producto.vue'
import Calendario from '@/views/admin/Calendario.vue'

import AppLayout from "@/layout/AppLayout.vue"
import NotFound from '../views/errors/NotFound.vue';
import NuevoPedido from '../views/admin/pedido/NuevoPedido.vue'
import ListaPedido from '../views/admin/pedido/ListaPedido.vue'
import Proveedor from '../views/admin/productos/Proveedor.vue'




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
   
    {
      path:'/login',
      name: 'Login',
      component: Login,
      meta:{requiereAuth: true}
    },
    {
      path: '/admin',
      component: AppLayout,
      children: [
        {
          path: 'calendario',
          name: 'Calendario',
          component: Calendario,
          meta:{requiereAuth: true}
        },
        {
          path: 'categoria',
          name: 'Categoria',
          component: Categoria,
          meta:{requiereAuth: true}
        },
        {
          path: 'usuario',
          name: 'Usuario',
          component: Usuario,
          meta:{requiereAuth: true}
        },
        {
          path: 'cliente',
          name: 'Cliente',
          component: Cliente,
          meta:{requiereAuth: true}
        },
        {
          path: 'producto',
          name: 'producto',
          component: Producto,
          meta:{requiereAuth: true}
        },
        {
          path: 'proveedor',
          name: 'proveedor',
          component: Proveedor,
          meta:{requiereAuth: true}
        },
        {
          path: 'pedido/Nuevo',
          name: 'NuevoPedido',
          component: NuevoPedido,
          meta:{requiereAuth: true}
        },
        {
          path: 'pedido',
          name: 'Pedidos',
          component: ListaPedido,
          meta:{requiereAuth: true}
        },
       




      ]
    },
    {
      path: "/:pathMatch(.*)*",
      name: 'NotFound',
      component: NotFound
    }
    
    
   

  ]
})

//guards para que la pagina de login este en blanco
router.beforeEach((to, from, next) => {
  let token = localStorage.getItem("access_token");

  // Si la ruta requiere autenticación y no hay token
  if (to.meta.requiereAuth && !token) {
    if (to.name === 'Login') {
      return next(); // Permite acceso al Login
    }
    return next({ name: 'Login' }); // Redirige a Login si no está autenticado
  }

  // Si la ruta tiene redirección para usuarios autenticados y hay token
  if (to.meta.redirectIfAuth && token) {
    if (to.name === 'Usuario') {
      return next(); // Permite acceso a Usuario
    }
    return next({ name: 'Usuario' }); // Redirige a Usuario si autenticado
  }

  return next(); // Permite la navegación para rutas públicas
});




export default router
