# tTable
tTable

DOCUMENTACION
smartcomments 
YUIDoc


<p>
<h3> PARAMETROS DE CAMPOS JSON</h3>


<!--
     nombreCampo: nombreCampo: nombre del campo en la BD
    id: En caso de que tenga un id es el nombre del campo en la base de datos. Usado generalmente para campos defs
    nro_campo_tipo: Tipo de campo def. Por defecto 104
    enDB: Si el campo def existe en la Base de datos.
    width: Porcentaje que se le va a asignar a la columna
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
    align: "center": Determina la alineacion del campo en las filas
    nulleable: por defecto false : Determina si el campo admite valores nulos.
    ordenable: por defecto true : Determina si la columna va a ser ordenable
    editable: Determina si el campo puede ser editado
    unico: Determina si el campo es unico
    //Existen funciones predefinidas para generar radiobuttons y Checkbox aunque se pueden generar personalizadas
    radioButton: Determina el campo es un radioButton
    checkOnDelete: Determina si se debe checkear antes de eliminar el campo
    checkBox: Determina si el campo es un radio button
-->
</p>

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
