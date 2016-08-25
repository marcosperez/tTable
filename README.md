# tTable
tTable

DOCUMENTACION
smartcomments 
YUIDoc


<p>
<h3> PARAMETROS DE CAMPOS JSON</h3>
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
</p>