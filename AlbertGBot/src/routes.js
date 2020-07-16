import language from './actions/language'
import ChosenCatala from './actions/chosen-catala'
import ChosenCastellano from './actions/chosen-castellano'
import Compra from './actions/compra'
import Marcas from './actions/marcas'
import Modelos from './actions/modelos'
import Despedida from './actions/despedida'
import Ayuda from './actions/ayuda'
import NotFound from './actions/noentiendo'

export const routes = [
  {
    path: 'language',
    text: /hola|Hola|buenas/,
    action: language,
    childRoutes: [
      {
        path: 'chosen-catala',
        payload: 'Català',
        action: ChosenCatala,
      },
      {
        path: 'chosen-castellano',
        payload: 'Castellano',
        action: ChosenCastellano,
      },
    ],
  },

  {
    path: 'compra',
    text: /comprar|compra|cotxe|coche|marca|marques|mirar/,
    action: Compra,
  },

  {
   path:'marcas',
   text:/audi|seat|opel|Audi|Seat|Opel/,
   action:Marcas,

  },


   {
     path:'modelos',
     text:/astra|vectra|corsa|A3|A4|Q5|leon|ibiza/,
     action:Modelos,
    },


  {
   path:'ayuda',
   text:/ayuda|ajuda|hacer|fer/,
   action:Ayuda,
   childRoutes: [
         {
         path:'compra',
         text:/Si|si|vale|Vale|ai|Ai|acuerdo|afirmativo/,
         action:Compra,
         },
         {
          path:'despedida',
          text:/No|no|np|Np|negativo/,
          action:Despedida,
          }

       ]
  },


   {
    path:'despedida',
    text:/adios|adeu|calla|apagate/,
    action:Despedida,
   },


 {path: '404', type: /^.*$/, action: NotFound}


]