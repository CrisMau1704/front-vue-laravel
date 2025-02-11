import {Api} from "./Api.services"

export default{
    login: (credenciales) =>{
        return Api().post('/v1/auth/login', credenciales);

    },
    registro: () => {

    },
    perfil: () => {

    },
    salir: () => {

    },

}

