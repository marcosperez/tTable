# tTable
tTable

DOCUMENTACION
smartcomments 
YUIDoc



<h3> PARAMETROS DE CAMPOS JSON</h3>
```javascript

    //es el nombre de la tabla y el id del div contenedor. Todo lo relacionado a la tabla lo utiliza
    this.nombreTabla = nombreTabla
    //Titulos que se van a colocar en la tabla, debe coincidir con la cantidad de campos.
    this.cabeceras = cabeceras;
    //campos que se van a mostrar, es una representacion json de varios parametros posibles.
    this.campos = campos;
    /*
        PARAMETROS DE CAMPOS JSON
        nombreCampo: nombreCampo: nombre del campo en la BD
        id: En caso de que tenga un id es el nombre del campo en la base de datos. Usado generalmente para campos defs
        nro_campo_tipo: Tipo de campo def. Por defecto 104
        enDB:(Default False) Si el campo def existe en la Base de datos.
        width: Porcentaje que se le va a asignar a la columna
        campoDefOpciones: Genera un campo def con las opciones pasadas (por defecto enDB:false)
                EJ:
                {
                    nombreCampo: "com_tipo_origen",
                    id: "nro_com_tipo_origen",
        ----------> campoDefOpciones: { filtroXML: nvFW.pageContents.filtroTipos, nro_campo_tipo: 1, cacheControl: true },
                     width: "18%"
                    , align: "center",nulleable:true,ordenable:true
                }

        [DEPRECADO] align: "center": Determina la alineacion del campo en las filas.
                    style: EJ:{'textAlign':'center'}, Permite establecer el estilo para la columna.
        nulleable: por defecto false : Determina si el campo admite valores nulos.
        ordenable: por defecto true : Determina si la columna va a ser ordenable
        editable: Determina si el campo puede ser editado
        unico: Determina si el campo es unico
        //Existen funciones predefinidas para generar radiobuttons y Checkbox aunque se pueden generar personalizadas
        radioButton: Determina el campo es un radioButton
        checkOnDelete: Determina si se debe checkear antes de eliminar el campo
        checkBox: Determina si el campo es un radio button

        PARA MAYOR PERSONALIZACION
        get_html(campo,nombreTabla,arregloValoresFila): Funcion que permite generar un html enriquesido para mostrar el campo.
        get_campo(nombreTabla, id): Definicion personalizada de campo def para cargar
                                    Ejemplo
                                    IMPORTANTE El id tiene que respetarse por que se utiliza para recuperar los valores.
                                     function (nombreTabla, id) {
                                        campos_defs.add(nombreTabla + "_campos_defs" + id,
                                            {
                                                nro_campo_tipo: 1, enDB: false,
                                                filtroXML: nvFW.pageContents.filtroEstados,
                                                target: 'campos_tb_' + nombreTabla + id
                                            });

        convertirValorBD: Permite convertir el valor que nos llega de la BD en un nuevo valor, ejemplo con fechas. Es muy util con 1 y 0 o true y false depende la necesidad.

        Ej:function (valor) { return valor.slice(0, 8); }
    */

    //Campos que se van a cargar desde el resultado de base de datos pero no se van a mostrar en la tabla
    //Json {nombreCampo: nombre del campo hide en la BD}
    this.camposHide = [];
    // Representa la consulta xml que va a cargar de datos la tabla
    this.filtroXML = filtroXML;
    //Filtro where aplicable a la consulta principal de la tabla
    this.filtroWhere = '';
    //Determina si las filas de la tabla son editables
    this.editable = true;
    //Determina si las filas de la tabla son eliminables
    this.eliminable = true;
    //Define el estilo del cuerpo de la tabla y otrs posibles parametros.
    this.tBody = {};
    this.tBody.style = "";
    //Define el estilo de las cabeceras de la tabla y otros posibles parametros
    this.tHeader = {};
    this.tHeader.style = "width:100%;";
    //Determina si se va a mostrar el boton agregar nueva fila al final de la tabla
    this.mostrarAgregar = true;
    //Determina si se verifica que siempre exista un radio button checkeado
    this.verificarRadioButton = false;

    //Variables de control
    //Establece cual es el radio button que esta actualmente seleccionado si existe
    this.radioSeleccionadoCampo = "";
    //Cantidad de filas totales de la tabla visibles e invisibles
    this.cantFilas = 0;
    //Cantidad de columnas de la tabla, generalmente igual a la cantidad de campos
    this.cantColumnas = 0;
    //determina si la tabla es asincronica, es true por defecto
    this.async = true;
    //Contiene los datos de la tabla en memoria para ordenarlos y almacenar valores ocultos y de control
    this.data = [];
    //Permite almacenar los valores anteriores a una modificacion de una fila.
    this.valoresAnteriores = [];


    //Metodos de la tabla
    //Genera e inserta el codigo HTML que dibuja el control
    this.table_load_html = table_load_html;
    this.agregar_espacios_en_blanco_dir = agregar_espacios_en_blanco_dir;
    this.validar = validar;
    this.getFila = getFila;
    this.modificar_fila = modificar_fila;
    this.generarXML = generarXML;
    this.getCelda = getCelda;
    this.indexReal = indexReal;
    this.disableColumns = disableColumns;
    this.refresh = refresh;
    this.addOnComplete = addOnComplete;
    this.onComplete = onComplete;
    this.getValor = getValor;
    this.setValor = setValor;
    this.modCelda = modCelda;

   

    //Variable de control
    this.agregar_fila = agregar_fila;
    this.eliminar_fila = eliminar_fila;
    //Grupo de funciones que se ejecutan cuando se completa la visibilizacion de la tabla.
    this.funcionesOnComplete = [];

    /* Determina si la columna tiene que ser deabilitada para edicion*/
    var columnasADeshabilitar = [];
    var estadoDeshabilitar = false;

    //Permite aplicar un estilo particular a una fila.
    this.estilo = backgroundColorCallback ? backgroundColorCallback : function (fila) { };
     //Metodos radio button
    this.funcionRadioButtonTable = funcionRadioButton;
    this.existenRadioButton = existenRadioButton;
    this.actualizarRadiobutton = actualizarRadiobutton;

    //Metodos checkbox
    this.funcionCheckBox = funcionCheckBox;
    
    
    //Metodos definidos por el usuario
    //Permtie especificar una funcion que se va a lanzar cuando se elimina una fila. Recibe como parametro la fila junto a sus parametros de control y camposHide.
    this.eliminar = callbackEliminar ? callbackEliminar : function (fila) { };

    //Permtie especificar una funcion que se va a lanzar cuando se modifique una fila. Recibe como parametro la fila junto a sus parametros de control y camposHide.
    this.modificar = callbackModificar ? callbackModificar : function (fila) { };
    
    //Permtie especificar una funcion que se va a lanzar cuando se llame al validar de la tabla, se ejecuta una vez por cada fila.
    //Recibe como parametro la fila junto a sus parametros de control y camposHide.
    this.validacion = callbackValidacion ? callbackValidacion : function (fila) {
        //validacion por defecto
        for (var index_colum = 0; index_colum < this.cantColumnas; index_colum++) {
            if (!this.campos[index_colum].nulleable &&
                !this.campos[index_colum].radioButton &&
                !this.campos[index_colum].checkBox &&
                fila[this.campos[index_colum].nombreCampo] == "" &&
                this.campos[index_colum].editable === undefined) {

                return false;
            }
        }

        return true;
    };

```
<h2>Ej Creacion</h2>
```javascript
tabla_tipos_abm = new tTable()

//Nombre de la tabla y id de la variable
tabla_tipos_abm.nombreTabla = "tabla_tipos_abm";

//Agregamos consulta XML
tabla_tipos_abm.filtroXML = nvFW.pageContents.filtroTipos;
tabla_tipos_abm.cabeceras = ["Nro Tipo", "Tipo","Style","Permiso","Nombre ASP"];
tabla_tipos_abm.async = true;
tabla_tipos_abm.campos = [
    {
        nombreCampo: "nro_com_tipo", nro_campo_tipo: 100, enDB: false, width: "10%",  editable: false,
            get_html: function (celda) { return celda.valor?celda.valor:'-'} , unico:true,ordenable:true
        },
    {
        nombreCampo: "com_tipo", nro_campo_tipo: 104, enDB: false, width: "20%"
    },
    {
        nombreCampo: "style", nro_campo_tipo: 104, enDB: false, width: "25%"//, unico: true
        , nulleable: true,style:{'textAlign':'center'}
    },
    {
        nombreCampo: "Permitir", id: "nro_permiso", nro_campo_tipo: 104, enDB: false, width: "20%",
        campoDefOpciones: { filtroXML: nvFW.pageContents.filtroPermisos, nro_campo_tipo: 1 }
    },
    {
        nombreCampo: "nombre_asp", nro_campo_tipo: 104, enDB: false, width: "35%",  nulleable: true
    }
]

tabla_tipos_abm.table_load_html();
tabla_tipos_abm.addOnComplete(function (tabla) {
    tabla.resize();
});
```
<h3>Ej Campos</h3>
```json
{
    nombreCampo: "nro_com_tipo", nro_campo_tipo: 100, enDB: false, width: "10%",  editable: false,
        get_html: function (celda) { return celda.valor?celda.valor:'-'} , unico:true,ordenable:true
    },
{
    nombreCampo: "com_tipo", nro_campo_tipo: 104, enDB: false, width: "20%"
},
{
    nombreCampo: "style", nro_campo_tipo: 104, enDB: false, width: "25%"//, unico: true
    , nulleable: true,style:{'textAlign':'center'}
},
{
    nombreCampo: "Permitir", id: "nro_permiso", nro_campo_tipo: 104, enDB: false, width: "20%",
    campoDefOpciones: { filtroXML: nvFW.pageContents.filtroPermisos, nro_campo_tipo: 1 }
},
{
    nombreCampo: "nombre_asp", nro_campo_tipo: 104, enDB: false, width: "35%",  nulleable: true
}
```
