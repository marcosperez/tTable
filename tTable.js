/**
 * Metodo que crea el objeto basico tTable. Los parametros son opcionales y pueden ser pasados luego de crearla.
 * @method tTable
 * @return 
 */
function tTable(nombreTabla, filtroXML, cabeceras, campos, callbackValidacion, callbackEliminar, callbackModificar, backgroundColorCallback, callbackOnComplete) {

    var table = this;
    //es el nombre de la tabla y el id del div contenedor. Todo lo relacionado a la tabla lo utiliza
    this.nombreTabla = nombreTabla
    //Titulos que se van a colocar en la tabla,     e coincidir con la cantidad de campos.
    this.cabeceras = cabeceras;
    //campos que se van a mostrar, es una representacion json de varios parametros posibles.
    this.campos = campos;
    //pila de acciones para deshacer
    this.deshacer_acciones = [];
    //verifica si se debe deshacer
    this.deshacer_acciones.activo = false;
    //id auto incremental para las filas
    this.idAutoIncremental = 0;
    /*
        PARAMETROS DE CAMPOS JSON
        nombreCampo: nombreCampo: nombre del campo en la BD
        id: En caso de que tenga un id es el nombre del campo en la base de datos. Usado generalmente para campos defs
        nro_campo_tipo: Tipo de campo def. Por defecto 104
        enDB:(Default False) Si el campo def existe en la Base de datos.
        width: Porcentaje que se le va a asignar a la columna
        valorDefecto: Valor o funcion que retorna un valor que se va asignar a un campo_def en caso de ser creado
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
        ordenButton: Permite utilizar la columna para subir o bajar filas particulares.
                        Es importante q el nombreCampo este en la BD para tomar ese criterio de ordenamiento.
                        En filtroXML se debe agregar como criterio de ordenamiento la columna de ordenamiento

        PARA MAYOR PERSONALIZACION
        --------------------------
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
    // Representa la string de conexion que se va a usar en el TRs
    this.cn = null;
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
    //podemos usar este metodo para conecer la cantidad de filas visibles totales de la tabla
    //this.cantFilasVislbles = tabla.indexReal(tabla.cantFilas);
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
    this.deshacer = deshacer;


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

    /**
    * Description
    * Valida que todas las filas cumplan con la funcion de validacion.
    * @method validar
    * @return Literal
    */
    function validar() {
        var resultado = true;

        for (var row_index = 1; row_index < this.cantFilas; row_index++) {
            //Si NO es valido retornamos false
            var fila = this.getFila(row_index)
            if (!this.validacion(fila) && !this.data[row_index].tabla_control.eliminado) {
                return false
            }
        }

        return true;
    }


    /**
     * Description
     * @method default_get_campo
     * Metodo basico que define como se crea un campo def general. Puede ser sobrescritar por otra funcion del usuario
     * @param {} nombreTabla
     * @param {} id
     * @param {} nro_campo_tipo
     * @param {} enDB
     * @return 
     */
    function default_get_campo(nombreTabla, id, nro_campo_tipo, enDB) {
        //var id = '_fila_' + row_index + '_columna_' + index_cell
        var opciones;

        //En caso de que se hallan definido opciones especiales para el campo def.
        if (!this.campoDefOpciones) {
            //Por defecto
            this.nro_campo_tipo = this.nro_campo_tipo ? this.nro_campo_tipo : 104;
            this.enDB = this.enDB ? this.enDB : false;
            opciones = {
                nro_campo_tipo: this.nro_campo_tipo
                , enDB: this.enDB
                , target: 'campos_tb_' + nombreTabla + id
            };

        } else {
            opciones = this.campoDefOpciones;
            opciones.target = 'campos_tb_' + nombreTabla + id;
            opciones.enDB = opciones.enDB ? opciones.enDB : false;
        }

        campos_defs.add(nombreTabla + "_campos_defs" + id, opciones);
    }


    /**
     * Description
     * Clase basica que contiene los datos de una columna. Es usado como parametro en varias funciones.
     * @method Campo
     * @return
     */
    function Campo() {
        this.id = "";
        this.valor;
        this.nombre;
        this.fila;
        this.columna;
    }

    /**
     * Description
     * @method agregar_fila: Permite mostrar filas, diferencia entre filas que vienen de la BD y filas nuevas a agregar.
     * @param {} valores_campos : valores actuales de los campos junto a sus camposHide y variables de control.
     * @return 
     */
    function agregar_fila(valores_campos) {

        var table = $('campos_tb_' + this.nombreTabla);
        table.deleteRow(table.rows.length - 1);
        var row = table.insertRow(table.rows.length);
        row.id = 'campos_tb_' + this.nombreTabla + '_fila_' + this.cantFilas;

        var celdas = [];
        var index_cell = 0;

        //Definimos la funcion de generacion del campo
        //Recorremos todos los campos
        for (; index_cell < this.campos.length; index_cell++) {
            celdas[index_cell] = row.insertCell(index_cell);
            valores_campos[index_cell].fila = this.cantFilas;
            celdas[index_cell].id = 'campos_tb_' + this.nombreTabla + '_fila_' + this.cantFilas + '_columna_' + index_cell

            //En caso de ser una fila que viene de la BD utilizamos el metodo getHTML para mostrar su contenido
            if (valores_campos[this.cantColumnas] && !valores_campos[this.cantColumnas + 1]) {
                if (this.campos[index_cell].get_html) {

                    celdas[index_cell].innerHTML = this.campos[index_cell].get_html(valores_campos[index_cell], this.nombreTabla, valores_campos);
                } else {

                    celdas[index_cell].innerHTML = valores_campos[index_cell].valor;

                }

                if (this.campos[index_cell].id) {
                    celdas[index_cell].idCampo = valores_campos[index_cell].id;
                }


            } else {
                //En caso de que el contenido de la celda no sea un html basico utilizamos el metodo getCampo para permitir su edicion.
                if (this.campos[index_cell].radioButton) {
                    //Definimos la funcion para los radio button.
                    this.campos[index_cell].get_campo = this.campos[index_cell].get_campo ?
                        this.campos[index_cell].get_campo :
                        funcionRadioButton;

                    celdas[index_cell].innerHTML = this.campos[index_cell].get_campo(valores_campos[index_cell]);
                } else if (this.campos[index_cell].checkBox) {
                    //Definimos la funcion para los checkBox.
                    this.campos[index_cell].get_campo = this.campos[index_cell].get_campo ?
                        this.campos[index_cell].get_campo : funcionCheckBox;
                    //Verificamos el valor del checkbox

                    celdas[index_cell].innerHTML = this.campos[index_cell].get_campo(valores_campos[index_cell], this.nombreTabla);

                } else {
                    //Verificiamos que exista la funcion get_Campo
                    //Utilizamos la funcion get_campo para mostrar un campo editable para el campo
                    this.campos[index_cell].get_campo = this.campos[index_cell].get_campo ?
                        this.campos[index_cell].get_campo :
                        default_get_campo;
                    var esEditable = this.campos[index_cell].editable === undefined || this.campos[index_cell].editable === true;
                    if (esEditable) {

                        this.campos[index_cell].get_campo(this.nombreTabla, '_fila_' + this.cantFilas + '_columna_' + index_cell);
                        var valorPorDefecto = this.campos[index_cell].valorDefecto;
                        if (valorPorDefecto){
                            //Verificamos si el valor por defecto viene en una funcion o en un valor
                            if(esFuncion(valorPorDefecto))
                                valorPorDefecto =valorPorDefecto();
                            //Seteamos el valor en el campo por defecto en el campo def_
                            campos_defs.set_value(this.nombreTabla + "_campos_defs" + '_fila_' + this.cantFilas + '_columna_' + index_cell, valorPorDefecto);
                            }
                        if (valores_campos[index_cell].valor && valores_campos[index_cell].valor != "") {

                            campos_defs.set_value(this.nombreTabla + "_campos_defs" + '_fila_' + this.cantFilas + '_columna_' + index_cell, valores_campos[index_cell].valor);
                        }
                    }
                    else {
                        if (this.campos[index_cell].get_html)
                            celdas[index_cell].innerHTML = this.campos[index_cell].get_html(valores_campos[index_cell], this.nombreTabla, valores_campos);
                        else
                            celdas[index_cell].innerHTML = valores_campos[index_cell].valor;
                    }


                }
            }

            //alinear si se definio alineado para el campo en cuestion.
            if (this.campos[index_cell].style) {
                for (key in this.campos[index_cell].style)
                    celdas[index_cell].style[key] = this.campos[index_cell].style[key];
            }

            //alinear si se definio alineado para el campo en cuestion.
            if (this.campos[index_cell].align)
                celdas[index_cell].style.textAlign = this.campos[index_cell].align;



        }

        //Agregamos los botones basicos
        //Borrar
        if (this.eliminable) {
            celdas[index_cell] = row.insertCell(index_cell);
            celdas[index_cell].id = 'campos_tb_' + this.nombreTabla + '_fila_' + this.cantFilas + '_columna_' + (index_cell)
            celdas[index_cell].innerHTML = '<center><img border="0"  onclick="' + this.nombreTabla + '.eliminar_fila(\'' + this.cantFilas + '\')" src="/FW/image/icons/eliminar.png" title="eliminar" style="cursor:pointer" /></center>';
            //celdas[index_cell].style.width = "12.5%";
            celdas[index_cell].style.align = "center";

            index_cell++;
        }

        //Modificar
        //En caso de que sea nuevo no va el boton modificar
        if (this.editable) {
            if (valores_campos[this.cantColumnas] + 1) {
                celdas[index_cell] = row.insertCell(index_cell);
                celdas[index_cell].id = 'campos_tb_' + this.nombreTabla + '_fila_' + (this.cantFilas - 1) + '_columna_' + (index_cell)
                celdas[index_cell].innerHTML = '<center><img border="0" onclick="' + this.nombreTabla + '.modificar_fila(\'' + this.cantFilas + '\')"src="/FW/image/icons/editar.png" title="editar" style="cursor:pointer"/></center>';
                //celdas[index_cell].style.width = "12.5%";
                celdas[index_cell].style.align = "center";
            } else {
                celdas[index_cell] = row.insertCell(index_cell);
            }
        }


        if (!this.data[this.cantFilas])
            this.data[this.cantFilas] = {};

        this.data[this.cantFilas].tabla_control = {
            existeEnBd: valores_campos[this.cantColumnas]
            , modificado: valores_campos[this.cantColumnas + 1]
            , eliminado: valores_campos[this.cantColumnas + 2]
            , ordenModificado: valores_campos[this.cantColumnas + 3]
            , idPermanente: valores_campos[this.cantColumnas + 4]
        }

        if (this.data[this.cantFilas].tabla_control.eliminado)
            this.eliminar_fila(this.cantFilas)

        this.cantFilas++;

        this.estilo(row);

        //info necesaria para la funcion deshacer
        if (this.deshacer_acciones.activo) {
            this.deshacer_acciones[this.deshacer_acciones.length] = {};
            this.deshacer_acciones[this.deshacer_acciones.length - 1]["accion"] = "agregar";
            this.deshacer_acciones[this.deshacer_acciones.length - 1]["fila"] = this.data[this.cantFilas - 1].tabla_control.idPermanente;
            this.deshacer_acciones.activo = false;
        }

        var row = table.insertRow(table.rows.length);

        campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);

    }

    /**
     * Description
     * @method agregar_espacios_en_blanco_dir
     * Permite agregar una nueva fila en blanco
     * @return 
     */
    function agregar_espacios_en_blanco_dir() {
        this.deshacer_acciones.activo = true;
        var row_index = 0
            , cell_index = 0;
        var valores_campos = [];
        //Verifica si existen radio button y checkea el primero.
        for (cell_index = 0; cell_index < this.campos.length; cell_index++) {
            if (this.indexReal(this.cantFilas) == 1 && this.campos[cell_index].radioButton) {
                valores_campos[cell_index] = {
                    valor: true
                    , columna: cell_index
                    , fila: this.cantFilas
                };
            } else {
                valores_campos[cell_index] = {
                    columna: cell_index
                    , fila: this.cantFilas
                };
            }
            if (this.campos[cell_index].checkBox)
                valores_campos[cell_index] = {
                    valor: true
                    , columna: cell_index
                    , fila: this.cantFilas
                }
        }

        this.idAutoIncremental++;
        
        //Configuramos los campos de control para filas nuevas
        //Determina si el valor viene de la base de datos
        valores_campos[cell_index] = false;
        //Determina si el valor fue modificado
        valores_campos[cell_index + 1] = false;
        //Determina si el valor fue eliminado
        valores_campos[cell_index + 2] = false;
        //Determina el orden de la nueva fila
        valores_campos[cell_index + 3] = false;
        //id auto incremenal
        valores_campos[cell_index + 4] = this.idAutoIncremental;

        //agregamos la fila a la tabla
        this.agregar_fila(valores_campos);

        //En caso de que se deba desabilitar una columna esta se bloquea.
        this.disableColumns(columnasADeshabilitar, estadoDeshabilitar);

        this.resize()
    }


    /**
     * Description
     * @method eliminar_fila
     * Oculta la fila pasada como parametro. Este indice tiene en cuenta las filas ocultas.
     * @param {} row_index
     * @return 
     */
    function eliminar_fila(row_index) {
        //En caso de que existan radiobuttons, se verifica que no se intente eliminar un radio button checkeado.
        if (!this.data[row_index].tabla_control.eliminado)
            this.deshacer_acciones.activo = true;

        if (this.verificarRadioButton && this.tieneRadiobuttonSeleccionado(row_index)) {
            alert("No se puede eliminar una fila activa");
        } else {
            this.data[row_index].tabla_control.eliminado = true;
            var tabla = $('campos_tb_' + this.nombreTabla);
            var fila = tabla.rows[row_index];

            //info para la funcion deshacer
            if (this.deshacer_acciones.activo) {
                this.deshacer_acciones[this.deshacer_acciones.length] = [];
                this.deshacer_acciones[this.deshacer_acciones.length - 1]["accion"] = "eliminar";
                this.deshacer_acciones[this.deshacer_acciones.length - 1]["fila"] = this.data[row_index].tabla_control.idPermanente;
                this.deshacer_acciones.activo = false;
            }
            if (this.data[row_index].tabla_control.existeEnBd) {
                this.eliminar(this.getFila(row_index));
            }

            //Ocultamos la fila que se va a eliminar
            fila.style.display = fila.style.display === 'none' ? 'table-row' : 'none';
            this.resize();

        }
    }



    /**
     * Description
     * @method modificar_fila
     * Recibe como parametro un numero de fila y la convierte en editable. Agrega todos los campos defs correspondientes.
     * @param {} row_index
     * @return 
     */
    function modificar_fila(row_index) {
        this.deshacer_acciones.activo = true;
        //Variables auxiliares
        var index_cell = 0;
        var fila = $('campos_tb_' + this.nombreTabla).rows[row_index];
        var esUnCampoDef = campos_defs.items[nombreCampoDef] ? true : false;

        for (; index_cell < this.cantColumnas; index_cell++) {
            var celda = fila.cells[index_cell];
            var nombreCampoDef = this.nombreTabla + "_campos_defs" + '_fila_' + row_index + '_columna_' + index_cell;
            var esEditable = this.campos[index_cell].editable === undefined || this.campos[index_cell].editable === true;

            //Variables booleanas 
            var tieneId = this.campos[index_cell].id ? true : false;
            var esUnRadiobutton = this.campos[index_cell].radioButton;
            var esUnico = this.campos[index_cell].unico;

            if (tieneId) {
                var valor = celda.idCampo;
            } else {
                var valor = celda.innerText;
                this.valoresAnteriores[nombreCampoDef] = valor;
            }

            if (!esUnRadiobutton && !esUnico && esEditable) {
                celda.innerHTML = "";

                if (!esUnCampoDef)
                    this.campos[index_cell].get_campo(this.nombreTabla, '_fila_' + row_index + '_columna_' + index_cell);

                //this.campos[index_cell].get_campo(nombreCampoDef);
                if (valor)
                    campos_defs.set_value(nombreCampoDef, valor);
            }
        }

        if (this.eliminable)
            index_cell++;

        fila.cells[index_cell].innerHTML = "";

        //Definimos en la tabla de control que se modifico la siguiente fila


        //info necesaria para la funcion deshacer 
        if (this.deshacer_acciones.activo) {
            this.deshacer_acciones[this.deshacer_acciones.length] = {};
            this.deshacer_acciones[this.deshacer_acciones.length - 1]["accion"] = "modificar";
            this.deshacer_acciones[this.deshacer_acciones.length - 1]["fila"] = this.data[row_index].tabla_control.idPermanente;
            this.deshacer_acciones[this.deshacer_acciones.length - 1]["datos"] = this.data[row_index];
            this.deshacer_acciones.activo = false;
        }

        this.data[row_index].tabla_control.modificado = true;

        //En caso de que tenga una callBack.. por defecto es vacio.
        this.modificar(this.getFila(row_index));
        //fila.style.display = fila.style.display === 'none' ? 'table-row' : 'none';
        this.disableColumns(columnasADeshabilitar, estadoDeshabilitar);

    }


    /**
     * Description
     * @method getCelda
     * Recupera los valores de una celda.
     * @param {} celda
     * @param {} fila_objeto
     * @param {} row_index
     * @param {} index_cell
     * @return fila_objeto
     */
    function getCelda(celda, fila_objeto, row_index, index_cell) {
        //Inicializacion de variables auxiliares
        var nombreCampoDef = this.nombreTabla + "_campos_defs" + '_fila_' + row_index + '_columna_' + index_cell;
        var nombreCampo = this.campos[index_cell].nombreCampo;
        var id = this.campos[index_cell].id;

        //Variables Booleanas
        var esUnRadiobutton = this.campos[index_cell].radioButton;
        var esUnCheckBox = this.campos[index_cell].checkBox;
        var tieneId = this.campos[index_cell].id ? true : false;
        var esUnCampoDef = campos_defs.items[nombreCampoDef] ? true : false;

        //Tiene Id lo que significa que se deben buscar dos valores.
        if (tieneId && !esUnRadiobutton) {
            if (esUnCampoDef) {
                fila_objeto[id] = campos_defs.get_value(nombreCampoDef);
            } else {
                fila_objeto[id] = celda.idCampo;
            }
        }

        //Es un radio button significa que debemos revisar si el valor esta checkeado.
        if (esUnRadiobutton || esUnCheckBox) {
            fila_objeto[nombreCampo] = celda.firstChild.checked;
        } else {
            //Revisamos si es un campo def
            if (esUnCampoDef) {
                fila_objeto[nombreCampo] = campos_defs.get_value(nombreCampoDef);

            } else {
                if (this.cantColumnas > index_cell){
                    //fila_objeto[nombreCampo] = celda.innerText;
                    fila_objeto[nombreCampo] = this.data[row_index][nombreCampo]
                }
            }
        }


        return fila_objeto;
    }

    /**
     * Description
     * @method getFila
     * Permite recuperar los valores de una fila. Se tienen encuentra filas ocultas.
     * @param {} row_index
     * @return fila_objeto
     */
    function getFila(row_index) {

        var fila = $('campos_tb_' + this.nombreTabla).rows[row_index];
        fila_objeto = {};

        //Cargamos los valores de las celdas.
        for (var index_cell = 0; index_cell < this.cantColumnas; index_cell++) {
            fila_objeto = this.getCelda(fila.cells[index_cell], fila_objeto, row_index, index_cell)
        }

        //Cargamos los valores de los campos ocultos.
        for (var index_campo = 0; index_campo < this.camposHide.length; index_campo++) {
            fila_objeto[this.camposHide[index_campo].nombreCampo] = this.data[row_index][this.camposHide[index_campo].nombreCampo];
        }
        //valores de control
        fila_objeto.indice = row_index;
        fila_objeto.existeEnBd = this.data[row_index].tabla_control.existeEnBd;
        fila_objeto.modificado = this.data[row_index].tabla_control.modificado;
        fila_objeto.eliminado = this.data[row_index].tabla_control.eliminado;
        fila_objeto.ordenModificado = this.data[row_index].tabla_control.ordenModificado;
        fila_objeto.idPermanente = this.data[row_index].tabla_control.idPermanente;

        return fila_objeto;
    }





    /**
     * Description
     * @method generarXML
     * Genera un xml segun los campos de control de la tabla.
     * Ejemplo, define una accion (modificar,eliminar,agregar) y los campos de la fila teniendo encuenta campos hide y anteriores a la modificacion.
     * <tag accion='modificar' id_cire_com_detalle='2' id_cire_com_detalleAnterior='2' />
     * @param {} tag
     * @return strXML
     */
    function generarXML(tag) {

        this.actualizarRadiobutton();

        var strXML = "";

        //{ existeEnBd: valores_campos[this.cantColumnas], modificado: valores_campos[this.cantColumnas + 1], eliminado: valores_campos[this.cantColumnas + 2] }
        for (var row_index = 1; row_index < this.cantFilas; row_index++) {
            //Recorremos todas las filas
            //Obtenemos la fila con indice row_index
            var fila = this.getFila(row_index);
            if (fila.eliminado) {
                //Existe en la BD y fue eliminado
                if (fila.existeEnBd) {
                    strXML += " <" + tag + " accion=";
                    strXML += "'eliminar'"
                    strXML += this.obtenerValoresXML(fila);
                    strXML += " /> "
                }

            } else {
                if (!fila.existeEnBd) {

                    strXML += "<" + tag + " accion=";
                    strXML += "'agregar'"
                    strXML += this.obtenerValoresXML(fila);
                    strXML += " />"
                }
                //Existe en la BD y fue modificado
                if (fila.existeEnBd && (fila.modificado || fila.ordenModificado)) {
                    strXML += "<" + tag + " accion=";
                    strXML += "'modificar'"
                    strXML += this.obtenerValoresXML(fila);
                    strXML += " />"
                }
            }
        }

        debugger
        return strXML;
    }

    //Retorna los valores de cada fila en formato XML
    /**
     * Description
     * @method obtenerValoresXML
     * Recupera todos los campos de la filta y los parsea a xml para ser incertados en el generarXML.
     * @param {} fila
     * @return valoresXML
     */
    this.obtenerValoresXML = function obtenerValoresXML(fila) {
        var valoresXML = " "
        var aux;

        for (var index_colum = 0; index_colum < this.cantColumnas; index_colum++) {
            var campoNombre = this.campos[index_colum].nombreCampo;
            var campoId = this.campos[index_colum].id;
            var esUnRadioButton = this.campos[index_colum].radioButton;
            aux = this.valoresAnteriores[this.nombreTabla + "_campos_defs" + '_fila_' + fila.indice + '_columna_' + index_colum];
            aux = aux ? aux : fila[campoNombre];

            if (esUnRadioButton) {
                valoresXML += campoNombre + "='";
                valoresXML += fila[campoNombre] ? "1" : "0";
                valoresXML += "' "
            } else {
                var valor = fila[campoNombre] ? fila[campoNombre] : "";
                valoresXML += campoNombre + "='" + fila[campoNombre] + "' ";
                valoresXML += campoNombre + "Anterior='" + aux + "' ";
            }

            if (campoId) {
                valoresXML += campoId + "='" + fila[campoId] + "' ";
            }
        }
        for (var index_campo = 0; index_campo < this.camposHide.length; index_campo++) {
            var campoNombre = this.camposHide[index_campo].nombreCampo ? this.camposHide[index_campo].nombreCampo : "";
            valoresXML += campoNombre + "='" + fila[campoNombre] + "' ";
        }


        return valoresXML;

    }

    /**
     * Description
     * @method indexReal
     * Calcula el numero de fila de una fila descontando las filas ocultas. Obtenemos el numero de fila visible en pantalla.
     * @param {} index
     * @return index
     */
    function indexReal(index) {

        var tabla = $('campos_tb_' + this.nombreTabla);
        var row;

        for (var i = index; i > -1; i--) {
            if (tabla.rows[i].style.display == 'none')
                index--;
        }
        return index;
    }



    /**
     * Description
     * @method disableColumns
     * Bloquea todos los campos de una columna.
     * @param {} nombresColumnas
     * @param {} estado
     * @return 
     */
    function disableColumns(nombresColumnas, estado) {

        var table_html = $('campos_tb_' + this.nombreTabla);

        if (table_html) {
            var row, nombreColumna;
            columnasADeshabilitar = nombresColumnas;
            estadoDeshabilitar = estado;

            for (var k = 0; k < nombresColumnas.length; k++) {
                nombreColumna = nombresColumnas[k];
                for (var i = 1; i < table_html.rows.length - 1; i++) { //filas
                    row = table_html.rows[i];

                    for (var j = 0; j < this.campos.length; j++) { //columnas
                        if ((!this.data[i].tabla_control.existeEnBd || this.data[i].tabla_control.modificado) && !this.data[i].tabla_control.eliminado) {
                            if (this.campos[j].nombreCampo != nombreColumna) continue;
                            celda = row.cells[j];
                            //document.getElementById(celda.id).disabled = (estado == true ? "disabled" : "");
                            //campos_defs.habilitar(celda.firstChild.id.substr(12, celda.firstChild.id.length), !estado)
                            campos_defs.habilitar(this.nombreTabla + "_campos_defs" + '_fila_' + i + '_columna_' + j, !estado)
                        }
                    }
                }

            }
        } else {

            /**
             * Description
             * @method desabilitar
             * @param {} tabla
             * @return 
             */
            var desabilitar = function (tabla) {
                tabla.disableColumns(nombresColumnas, estado)
            };
            this.addOnComplete(desabilitar);
        }
    }




    /**
     * Description
     * Quita todos los campos defs de la tabla. Se utiliza generalmente previo al refresco de tabla o ordenamiento.
     * @method removeCamposDef
     * @return 
     */
    this.removeCamposDef = function removeCamposDef() {
        var tabla = $('campos_tb_' + this.nombreTabla);
        if (tabla)
            for (var i = 0; i < tabla.rows.length - 1; i++) { //filas
                for (var j = 0; j < this.campos.length; j++) { //columnas
                    esUnCampoDef = campos_defs.items[this.nombreTabla + "_campos_defs" + '_fila_' + i + '_columna_' + j] ? true : false;
                    if (esUnCampoDef)
                        campos_defs.remove(this.nombreTabla + "_campos_defs" + '_fila_' + i + '_columna_' + j);
                }
            }
    }

    /**
     * Description
     * Recarga la tabla borrando campos defs y realizando nuevamente la consulta.
     * @method refresh
     * @param {} filtro
     * @return 
     */
    function refresh(filtro) {
        if (filtro) this.filtroWhere = filtro;
        this.removeCamposDef();
        this.table_load_html(this);
    }

    /**
     * Description
     * Carga la tabla segun el metodo especificado
     * @method table_load_html
     * @return 
     */
    function table_load_html() {
        //
        if (this.async)
            this.table_load_html_ascy(this);
        else
            this.table_load_html_sync(this);

    }

    /**
     * Description
     * Actualiza los datos almacenados en memoria sobre las filas de la tabla. Esto es previo a una reordenacion.
     * @method actualizarData
     * @return 
     */
    this.actualizarData = function () {

        for (var row_index = 1 ; row_index < this.data.length ; row_index++) {
            if (!this.data[row_index].tabla_control.existeEnBd || this.data[row_index].tabla_control.modificado) {
                var fila = this.getFila(row_index);
                this.data[row_index] = fila;
                this.data[row_index].tabla_control = {};
                this.data[row_index].tabla_control.existeEnBd = fila.existeEnBd;
                this.data[row_index].tabla_control.modificado = fila.modificado;
                this.data[row_index].tabla_control.eliminado = fila.eliminado;
                this.data[row_index].tabla_control.ordenModificado = fila.ordenModificado;
                this.data[row_index].tabla_control.idPermanente = fila.idPermanente;
            }
        }
    }
    /**
     * Description
     * Ordena una tabla segun una cabecera especificado.
     * @method ordenar
     * @param {} cabecera
     * @param {} tipo
     * @param {} nro_campo_tipo: si el nro_campo_tipo se realiza ordenacion por valor numerico.
     * @return 
     */

    var datosAnteriores;
    this.ordenar = function (cabecera, tipo, nro_campo_tipo, deshacer) {

        if (this.validar()) {
            if (!datosAnteriores) {
                this.deshacer_acciones[this.deshacer_acciones.length] = [];
                this.deshacer_acciones[this.deshacer_acciones.length - 1]["cabecera"] = this.campos[0].nombreCampo;
                this.deshacer_acciones[this.deshacer_acciones.length - 1]["nro_campo_tipo"] = this.campos[0].nro_campo_tipo;
                this.deshacer_acciones[this.deshacer_acciones.length - 1]["tipo"] = "DESC";
                this.deshacer_acciones[this.deshacer_acciones.length - 1]["accion"] = "orden";

                datosAnteriores = [];
                datosAnteriores.tipo = "ASC";
                datosAnteriores.nro_campo_tipo = this.campos[0].nro_campo_tipo;
                datosAnteriores.cabecera = this.campos[0].nombreCampo;
            }
            else {
                    if(!deshacer) {
                        this.deshacer_acciones[this.deshacer_acciones.length] = [];
                        this.deshacer_acciones[this.deshacer_acciones.length - 1]["tipo"] = datosAnteriores.tipo;
                        this.deshacer_acciones[this.deshacer_acciones.length - 1]["nro_campo_tipo"] = datosAnteriores.nro_campo_tipo;
                        this.deshacer_acciones[this.deshacer_acciones.length - 1]["cabecera"] = datosAnteriores.cabecera;
                        this.deshacer_acciones[this.deshacer_acciones.length - 1]["accion"] = "orden";

                        datosAnteriores.tipo = tipo;
                        datosAnteriores.nro_campo_tipo = nro_campo_tipo;
                        datosAnteriores.cabecera = cabecera;
                    }
            }

            this.actualizarData();

            this.data.shift();
            var cabecera = cabecera;
            var funcionOrdenacion;

            if (tipo == 'DESC') {
                /**
                 * Description
                 * @param {} a
                 * @param {} b
                 * @return Literal
                 */
                funcionOrdenacion = function (a, b) {

                    v1 = (nro_campo_tipo == '100') ? parseInt(a[cabecera]) : a[cabecera];
                    v2 = (nro_campo_tipo == '100') ? parseInt(b[cabecera]) : b[cabecera];
                    if (!v1)
                        return -1
                    if (!v2)
                        return 1

                    if (v1 > v2) {
                        return -1;
                    }
                    else if (v1 < v2) {
                        return 1;
                    }
                    return 0;
                };
            } 
            else {
                /**
                 * Description
                 * @param {} a
                 * @param {} b
                 * @return Literal
                 */
                funcionOrdenacion = function (a, b) {
                    v1 = (nro_campo_tipo == '100') ? parseInt(a[cabecera]) : a[cabecera];
                    v2 = (nro_campo_tipo == '100') ? parseInt(b[cabecera]) : b[cabecera];

                    if (!v1)
                        return 1
                    if (!v2)
                        return -1

                    if (v1 < v2) {
                        return -1;
                    }
                    else if (v1 > v2) {
                        return 1;
                    }
                    return 0;
                };
            }
            this.data.sort(funcionOrdenacion);

            this.mostrar_tabla(this);
    } 
        else {
            alert("Los valores a ordenar son invalidos");
        }
    }

    /**
     * Description
     * Realiza la consulta a la base de datos y completa la tabla
     * @method table_load_html_ascy
     * @param {} tabla
     * @return 
     */
    this.table_load_html_ascy = function (tabla) {
        //Reinicializacion de los parametros basico de la tabla
        tabla.cantColumnas = 0;
        tabla.cantFilas = 0;
        tabla.radioSeleccionadoCampo = "";

        var rs = new tRS();
        rs.async = true;
        if (tabla.cn)
            rs.cn = tabla.cn;
        nvFW.bloqueo_activar($(tabla.nombreTabla), 'cargando-' + tabla.nombreTabla);

        rs.onComplete = function () {
            tabla.data = [];
            while (!rs.eof()) {
                var fila = {};
                //Para cada campo recuperamos su valor y su id correspondiente en caso de contar con uno.
                for (var index_campos = 0; index_campos < tabla.campos.length; index_campos++) {
                    var valor_campo = rs.getdata(tabla.campos[index_campos].nombreCampo);
                    fila[tabla.campos[index_campos].nombreCampo] = valor_campo ? valor_campo : "";
                    if (tabla.campos[index_campos].id) {
                        var valor_id = rs.getdata(tabla.campos[index_campos].id);
                        fila[tabla.campos[index_campos].id] = valor_id ? valor_id : "";
                    }
                }

                //Para cada campo hide recuperamos el valor y lo almacenamos en los datos de la fila.
                for (var index_campos = 0; index_campos < tabla.camposHide.length; index_campos++) {

                    fila[tabla.camposHide[index_campos].nombreCampo] = rs.getdata(tabla.camposHide[index_campos].nombreCampo);
                }

                fila.tabla_control = {};
                tabla.data.push(fila);

                rs.movenext();
            }


            tabla.mostrar_tabla(tabla);


            nvFW.bloqueo_desactivar($(tabla.nombreTabla), 'cargando-' + tabla.nombreTabla);

            //Lanza el metodo onComplete en caso de estar definido.

            tabla.onComplete(tabla);
        }.bind(this)

        rs.open(tabla.filtroXML, '', tabla.filtroWhere, '', '');

    }

    /**
     * Description
     *  NO FUNCIONA
     * @method table_load_html_sync
     * @param {} tabla
     * @return 
     */
    this.table_load_html_sync = function (tabla) {
        /*
        this.cantColumnas = 0;
        this.cantFilas = 0;
        this.radioSeleccionadoCampo = "";
        this.tabla_control = [];

        if (!lista_rs)
            lista_rs = [];



        var rs = new tRS();
        lista_rs[tabla.nombreTabla] = rs;


        rs.open(this.filtroXML, '', this.filtroWhere, '', '');
        tabla.mostrar_tabla(tabla);
        */
    }

    /**
     * Description
     * Calcula el tamaño de la tabla y lo adapta a el tamaño de su contenedor.
     * @method resize
     * @return 
     */
    this.resize = function () {

        var tabla = this;
        var container = $(tabla.nombreTabla).parentNode
        var childrens = container.children;
        var h = container.getHeight()
        for (var i = 0; i < childrens.length; i++) {
            if (childrens[i].id != tabla.nombreTabla)
                h -= childrens[i].getHeight();
        }
        var div_titulos = $("div_titulos_" + tabla.nombreTabla);
        if (div_titulos) {
            h -= div_titulos.getHeight()
        }
        var div_boton = $("div_boton_" + tabla.nombreTabla);
        if (div_boton) {
            h -= div_boton.getHeight()
        }
        if (this.mostrarAgregar) {
            var div_boton = $("div_boton_" + tabla.nombreTabla);
            if (div_boton) {
                h -= div_boton.getHeight()
            }
        }
        else {
            try {
                $("div_boton_" + tabla.nombreTabla).display = "none";
                $("div_boton_" + tabla.nombreTabla).innerHTML = '';
            } catch (err) {
                console.log(err);
            }
        }

        if (div_boton && h > 5) {
            if ($("campos_tb_" + tabla.nombreTabla).getHeight() > h) {
                $("div_cuerpo_" + tabla.nombreTabla).setStyle({ height: h + 'px', overflow: "auto" });
            } else {
                $("div_cuerpo_" + tabla.nombreTabla).setStyle({ height: '', overflow: "auto" });
            }
        } else {
            if ($("div_cuerpo_" + tabla.nombreTabla))
                $("div_cuerpo_" + tabla.nombreTabla).setStyle({ height: '', overflow: "auto" });
        }
        campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);


    }

    /**
     * Description
     * Genera el html de la tabla segun las especificaciones cargadas.
     * @method mostrar_tabla
     * @param {} tabla
     * @return 
     */
    this.mostrar_tabla = function (tabla) {
        this.removeCamposDef();

        tabla.cantFilas = 1;
        tabla.cantColumnas = 0;

        var fila = {};
        fila.tabla_control = {};
        fila.tabla_control = {
            existeEnBd: 0
            , modificado: 0
            , eliminado: 0
            , ordenModificado: 0
            , idPermanente: 0
        }
        tabla.data.unshift(fila);

        var srtHtml =
            '<div style="width:100%;height:100%;overflow:hidden;background-color:white;">' +
            '<div style="overflow:hidden;" id="div_titulos_' + tabla.nombreTabla + '" >' +
            '<table style="' + tabla.tHeader.style + '"  id="header_tbl_' + tabla.nombreTabla + '" >  ' +
            '<tr class="tbLabel">';

        var existeColumnaDeOrden = false;
        for (col_index = 0; col_index < tabla.campos.length; col_index++) {
            var existeColumnaDeOrden = (tabla.campos[col_index].ordenButton === undefined) ? false : true;
            if (existeColumnaDeOrden)
                break;
        }
        for (col_index = 0; col_index < tabla.campos.length; col_index++) {
            //Cargamos valor por defecto campos de tipo texto.
            tabla.campos[col_index].nro_campo_tipo = tabla.campos[col_index].nro_campo_tipo ? tabla.campos[col_index].nro_campo_tipo : '104';
            var ordenHTML = '';

            //Valores de control 
            var tieneGetHtml = tabla.campos[col_index].get_html ? true : false;
            var tieneCheckbox = tabla.campos[col_index].checkBox ? true : false;
            var tieneRadioButton = tabla.campos[col_index].radioButton ? true : false;
            var esOrdenable = (tabla.campos[col_index].ordenable === undefined) ? true : false;

            //Para los getHtml(se puede especificar ordenable:true para permitirlo), Checkbox y raddiobutton no se permite que sean ordenables.
            if (!existeColumnaDeOrden && tabla.campos[col_index].ordenable === true || !existeColumnaDeOrden && (!tieneGetHtml && !tieneCheckbox && !tieneRadioButton && esOrdenable)) {
                ordenHTML = '<img src="/FW/image/icons/up_a.png" onclick="return ' + tabla.nombreTabla + '.ordenar( \'' + tabla.campos[col_index].nombreCampo + '\' ,\'ASC\',\'' + tabla.campos[col_index].nro_campo_tipo + '\')"></img>' +
                '<img  src="/FW/image/icons/down_a.png" onclick="return ' + tabla.nombreTabla + '.ordenar( \'' + tabla.campos[col_index].nombreCampo + '\',\'DESC\',\'' + tabla.campos[col_index].nro_campo_tipo + '\' )"></img>'
            }
            srtHtml += '<td style="text-align: center;width:' + tabla.campos[col_index].width + ';">' +
                 ordenHTML +
                tabla.cabeceras[col_index] + '</td>';
            tabla.cantColumnas++
        }

        srtHtml += tabla.eliminable ? '<td style="text-align: center;width:12.5%;">Eliminar</td>' : "";
        srtHtml += tabla.editable ? '<td style="text-align: center;width:12.5%;">Editar</td>' : "";
        srtHtml += '</tr>' + '</table></div>';


        srtHtml = srtHtml +
            '<div id="div_cuerpo_' + tabla.nombreTabla + '" style="overflow:auto;width: 100%;heigth:100%">' +
            '<table id="campos_tb_' + tabla.nombreTabla + '" class="tb1" style="' + this.tBody.style + '" ><tr style=" visibility: hidden ; height:0px">';
        for (row_index = 0; row_index < tabla.cabeceras.length; row_index++) {
            srtHtml += '<td></td>';
        }
        srtHtml += tabla.eliminable ? '<td></td>' : "";
        srtHtml += tabla.editable ? '<td></td>' : "";

        srtHtml = srtHtml + '</tr></table>' + '</div>' +
            '<div id="div_boton_' + tabla.nombreTabla + '" ><center><img border="0" onclick="' + tabla.nombreTabla +
            '.agregar_espacios_en_blanco_dir()" src="/FW/image/icons/agregar.png" title="editar" style="cursor:pointer"/></center></div></div>'

        var contenedor = $(tabla.nombreTabla);
        contenedor.innerHTML = "";
        contenedor.insert({
            top: srtHtml
        });

        var table = $('campos_tb_' + tabla.nombreTabla);
        table.className = "tb1 highlightEven highlightTROver scroll"
        /*
        //Intento de cambiar el css de forma dinamica para evitar que se coloren filas hidden
        document.createElement('style')
        sheet.innerHTML = "#tTableStyle tr[@display=block]:nth-child(odd) {  background-color:  #000;  }"+
                            " #tTableStyle tr[@display=block]:nth-child(even) {  background-color:  red;  }";
        document.body.appendChild(sheet);*/

        var row = table.insertRow(table.rows.length);

        var filas_aux = 0;

        //Generamos el html para todas las fials segun los valores de campo enviados.
        for (var indice_fila = 1 ; indice_fila < tabla.data.length; indice_fila++) {
            var valores_campos = [];
            var index_cell = 0

            //Armamos la fila que se va a agregar
            for (; index_cell < tabla.campos.length; index_cell++) {
                campo = new Campo();
                campo.fila = filas_aux;
                campo.columna = index_cell;
                //Revisamos si es un radioButton para asinar la funcion de generacion.
                if (tabla.campos[index_cell].radioButton) {
                    tabla.campos[index_cell].get_campo = tabla.funcionRadioButtonTable;
                    tabla.campos[index_cell].get_html = tabla.funcionRadioButtonTable;
                }
                if (tabla.campos[index_cell].ordenButton) {

                    tabla.campos[index_cell].editable = false;
                    tabla.campos[index_cell].get_campo = "";
                    var indiceColumna = index_cell;
                    tabla.campos[index_cell].get_html = function (indice_fila) {
                        return '<a onclick="' + tabla.nombreTabla + '.subir_fila(' + indice_fila.fila + ',' + indiceColumna + ')"><img src="/FW/image/icons/up_a.png" border="0" hspace="0"></a>' +
                        '<a onclick="' + tabla.nombreTabla + '.bajar_fila(' + indice_fila.fila + ',' + indiceColumna + ')"><img src="/FW/image/icons/down_a.png" border="0" hspace="0"></a>'
                    };
                }
                //Revisamos si es unradiobuton
                if (tabla.campos[index_cell].checkBox) {
                    tabla.campos[index_cell].get_campo = tabla.funcionCheckBox;
                    tabla.campos[index_cell].get_html = tabla.funcionCheckBox;
                } else {
                    tabla.campos[index_cell].get_campo = tabla.campos[index_cell].get_campo ?
                        tabla.campos[index_cell].get_campo :
                        default_get_campo;
                }

                if (tabla.campos[index_cell].id) {

                    campo.id = tabla.data[indice_fila][tabla.campos[index_cell].id];

                }

                tabla.campos[index_cell].convertirValorBD = (!tabla.campos[index_cell].convertirValorBD) ? function (valor) {
                    return valor
                } : tabla.campos[index_cell].convertirValorBD;
                //
                campo.valor = tabla.campos[index_cell].convertirValorBD(tabla.data[indice_fila][tabla.campos[index_cell].nombreCampo]);
                campo.nombre = tabla.campos[index_cell].nombreCampo;
                valores_campos[index_cell] = campo;

            }
            filas_aux++;

            //Determina si el valor viene de la base de datos
            valores_campos[index_cell] = tabla.data[indice_fila].tabla_control.existeEnBd != undefined ? tabla.data[indice_fila].tabla_control.existeEnBd : true;
            //Determina si el valor fue modificado
            valores_campos[index_cell + 1] = tabla.data[indice_fila].tabla_control.modificado != undefined ? tabla.data[indice_fila].tabla_control.modificado : false;
            //Determina si el valor fue eliminado
            valores_campos[index_cell + 2] = tabla.data[indice_fila].tabla_control.eliminado != undefined ? tabla.data[indice_fila].tabla_control.eliminado : false;
            //Determina si se cambio el orden
            valores_campos[index_cell + 3] = tabla.data[indice_fila].tabla_control.ordenModificado != undefined ? tabla.data[indice_fila].tabla_control.ordenModificado : false;
            //Determina si se cambio el orden
            valores_campos[index_cell + 4] = tabla.data[indice_fila].tabla_control.idPermanente != undefined ? tabla.data[indice_fila].tabla_control.idPermanente : this.idAutoIncremental;

            this.idAutoIncremental++;

            tabla.agregar_fila(valores_campos);

        }

        tabla.resize();
    }


    /**
     * Description
     * Permite bajar una fila de la tabla
     * @method bajar_fila
     * @param {} fila
     * @param {} columna
     * @return 
     */
    this.bajar_fila = function (fila, columna) {
        //si es la ultima fila sale
        if ((this.getFila(fila).indice + 1) == this.cantFilas)
            //if ((this.getFila(fila).indice - 1) == this.cantColumnas)
            return;

        this.swap_fila(fila, columna, 1)
    }

    /**
     * Description
     * Permite subir una fila de la tabla
     * @method subir_fila
     * @param {} fila
     * @param {} columna
     * @return 
     */
    this.subir_fila = function (fila, columna) {
        //Si es la primer fila sale
        if (this.getFila(fila).indice == 1) return;

        this.swap_fila(fila, columna, -1)
    }

    /**
     * Description
     * Funcion auxiliar para modificar el orden de las filas
     * @method subir_fila
     * @param {} fila
     * @param {} columna
     * @param {} ord: 1 para subir la fila, -1 para bajarla
     * @return 
     */
    this.swap_fila = function (fila, columna, ord) {

        //info para deshacer acciones
        this.deshacer_acciones[this.deshacer_acciones.length] = [];
        this.deshacer_acciones[this.deshacer_acciones.length - 1]["accion"] = "ordenModificado";
        this.deshacer_acciones[this.deshacer_acciones.length - 1]["fila"] = this.data[fila].tabla_control.idPermanente;;
        this.deshacer_acciones[this.deshacer_acciones.length - 1]["orden"] = ord;
        this.deshacer_acciones[this.deshacer_acciones.length - 1]["columna"] = columna;

        this.actualizarData();

        this.data[fila].tabla_control.ordenModificado = true;
        this.data[fila + ord].tabla_control.ordenModificado = true;

        if (!this.data[fila][this.campos[columna].nombreCampo])
            this.data[fila][this.campos[columna].nombreCampo] = parseInt(this.data[fila + ord][this.campos[columna].nombreCampo]) + 1 + ""

        var swapOrden = this.data[fila][this.campos[columna].nombreCampo]
        this.data[fila][this.campos[columna].nombreCampo] = this.data[fila + ord][this.campos[columna].nombreCampo]
        this.data[fila + ord][this.campos[columna].nombreCampo] = swapOrden

        var swap = this.data[fila];
        this.data[fila] = this.data[fila + ord];
        this.data[fila + ord] = swap;

        this.data.shift();


        this.mostrar_tabla(this);
    }

    /**
     * Description
     * Permite agregar una funcion que se va a ejecutar cuando se complete la carga del html de la tabla
     * @method addOnComplete
     * @param {} f
     * @return 
     */
    function addOnComplete(f) {
        this.funcionesOnComplete.push(f);
    }

    /**
     * Description
     * Ejecuta todas las funciones agregadas en el AddOnComplete
     * @method onComplete
     * @param {} tabla
     * @return 
     */
    function onComplete(tabla) {
        for (var index = 0; index < tabla.funcionesOnComplete.length; index++)
            tabla.funcionesOnComplete[index](tabla);
    }


    /**
     * Description
     * Setea un valor en una celda segun su fila y nombre de campo.
     * @method setValor
     * @param {} nombreCampo
     * @param {} row_index
     * @param {} valor
     * @return 
     */
    function setValor(nombreCampo, row_index, valor) {

        var fila = $('campos_tb_' + this.nombreTabla).rows[row_index];
        for (var index_cell = 0; index_cell < this.cantColumnas; index_cell++) {
            if (this.campos[index_cell].nombreCampo == nombreCampo) {
                this.modCelda(fila.cells[index_cell], fila_objeto, row_index, index_cell, valor);
                break;
            }
        }
    }

    /**
     * Description
     * Carga el calor enviado en una celda verificando su tipo.
     * @method modCelda
     * @param {} celda
     * @param {} fila_objeto
     * @param {} row_index
     * @param {} index_cell
     * @param {} valor
     * @return 
     */
    function modCelda(celda, fila_objeto, row_index, index_cell, valor) {
        //Inicializacion de variables auxiliares
        var nombreCampoDef = this.nombreTabla + "_campos_defs" + '_fila_' + row_index + '_columna_' + index_cell;
        var nombreCampo = this.campos[index_cell].nombreCampo;
        var id = this.campos[index_cell].id;

        //Variables Booleanas
        var esUnRadiobutton = this.campos[index_cell].radioButton;
        var esUnCheckBox = this.campos[index_cell].checkBox;
        var tieneId = this.campos[index_cell].id ? true : false;
        var esUnCampoDef = campos_defs.items[nombreCampoDef] ? true : false;

        //Tiene Id lo que significa que se deben buscar dos valores.
        if (tieneId && !esUnRadiobutton) {
            if (esUnCampoDef) {
                fila_objeto[id] = campos_defs.get_value(nombreCampoDef);
            } else {
                fila_objeto[id] = celda.idCampo;
            }
        }

        if (esUnRadiobutton || esUnCheckBox) {
            celda.firstChild.checked = valor;
        } else {
            //Revisamos si es un campo def
            if (esUnCampoDef) {
                campos_defs.set_value(nombreCampoDef, valor);
            } else {
                if (this.cantColumnas > index_cell)
                    celda.innerText = valor;
            }
        }
    }

    /**
     * Description
     * Recupera el valor de una fila segun su nombre de campo.
     * @method getValor
     * @param {} nombreCampo
     * @param {} row_index
     * @return 
     */
    function getValor(nombreCampo, row_index) {

        var table_html = $('campos_tb_' + this.nombreTabla);

        if (table_html) {
            var fila = this.getFila(this.indexReal(row_index + 1));
            var celda = fila[nombreCampo]
            return celda;
        }
        else {
            /**
             * Description
             * @method valor
             * @param {} tabla
             * @return 
             */
            var valor = function (tabla) {
                tabla.getValor(nombreCampo, row_index)
            };
            this.addOnComplete(valor);
        }
    }


    /************************************** UTILES ***********************************************************************/
    /**
    * Description
    * Verifica que el calor pasado sea un funcion
    * @method esFuncion
    * @param {} valor
    * @return true para funciones, false para el resto
    */
    function esFuncion(valor){
        if (typeof valor === "function")
            return true;
        return false;
    }

    /*********************CHECKBOX *************/
    /**
    * Description
    * Especifica que check fue marcado.
    * @method click_check
    * @param {} fila
    * @return
    */
    this.click_check = function (fila, columna) {

        console.log(columna)
        this.data[fila].tabla_control.modificado = true;
    }

    /**
     * Description
     * @method funcionCheckBox
     * @param {} check
     * @param {} nombreTabla
     * @return strHtml
     */
    function funcionCheckBox(check, nombreTabla) {
        var stringCheck = "";

        if (check.valor == true || check.valor == "True" || check.valor == 1)
            stringCheck += 'true" checked>';
        else
            stringCheck += 'false">';
        //
        var strHtml = '<input type="checkbox" onclick="' + nombreTabla + '.click_check(' + check.fila + ',' + check.columna + ')" name="vehicle" value="' + stringCheck;

        return strHtml;
    }


    /*********************RADIOBUTTON *************/

    /**
     * Description
     * @method tieneRadiobuttonSeleccionado
     * Verifica si existen radios button seleccionado en una fila.
     * @param {} index_row
     * @return valor
     */
    this.tieneRadiobuttonSeleccionado = function (index_row) {
        valor = false;

        for (var index_cell = 0; index_cell < this.campos.length; index_cell++)
            if (this.campos[index_cell].radioButton) {

                var fila = this.getFila(index_row);
                valor = fila[this.campos[index_cell].nombreCampo];
                valor = this.campos[index_cell].checkOnDelete ? valor : false;
            }

        return valor;
    }

    /**
     * Description
     * @method existenRadioButton
     * @return Literal
     */
    function existenRadioButton() {
        for (var index_colum = 0; index_colum < this.cantColumnas; index_colum++) {
            if (this.campos[index_colum].radioButton)
                return index_colum + 1;
        }

        return 0;
    }

    /**
     * Description
     * @method actualizarRadiobutton
     * @return
     */
    function actualizarRadiobutton() {
        var existenRadioButton = this.existenRadioButton();
        //revisamos si se modificaron los radioButtons. Si es que existen.
        if (existenRadioButton) {
            //Verificar Checkbox
            var seleccionado = this.radioSeleccionadoCampo;

            if (seleccionado) {
                for (var row_index = 1; row_index < this.cantFilas; row_index++) {
                    fila = this.getFila(row_index);
                    //si el radio esta checkeado y es diferente al inicial
                    if (fila[this.campos[seleccionado.columna].nombreCampo] == true && (seleccionado.fila) != fila.indice) {
                        this.data[fila.indice].tabla_control.modificado = true;
                        this.data[seleccionado.fila].tabla_control.modificado = true;

                    }
                }
            } else {
                for (var row_index = 1; row_index < this.cantFilas; row_index++) {
                    fila = this.getFila(row_index);
                    //si el radio esta checkeado y es diferente al inicial
                    if (fila[this.campos[existenRadioButton - 1].nombreCampo] == true && seleccionado.fila != fila.indice) {
                        this.data[fila.indice].tabla_control.modificado = true;

                    }
                }
            }
        }
    }
    /**
     * Description
     * @method funcionRadioButton
     * Genera un radio button
     * @param {} c
     * @return BinaryExpression
     */
    function funcionRadioButton(c) {
        var stringRadio = "";
        if (c.valor == true) {
            stringRadio += 'true" checked>';
            c.fila;
            table.radioSeleccionadoCampo = c;
        } else {
            stringRadio += 'false">';
        }

        return '<input type="radio"  name="radiobutton" value="' + stringRadio + '<br>';
    }

    this.validarRadioButtonSeleccionado = function (nombreCampo) {
        var contador = 0;
        for (var row_index = 1; row_index < this.filas; row_index++) {
            if (!this.data[row_index].tabla_control.eliminado) {
                contador++;
                var fila = this.getFila(row_index);
                if (fila[nombreCampo])
                    return true;
            }
        }
        //en caso de que no halla filas
        if (contador == 0)
            return true;

        //Si existe por lo menos una fila y no tiene radiobutton activado devolvemos false
        return false;

    }
    
    function deshacer() {

        if (!this.deshacer_acciones.length)
            return;

        var tabla = $('campos_tb_' + this.nombreTabla);
       
        if (this.deshacer_acciones[this.deshacer_acciones.length - 1].accion == 'eliminar') {
            
            var fila = tabla.rows[this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data)];
            fila.style.display = 'table-row';
            this.data[this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data)].tabla_control.eliminado = false;
            this.deshacer_acciones.splice(this.deshacer_acciones.length - 1, 1);
            this.actualizarData();
        }
        else if (this.deshacer_acciones[this.deshacer_acciones.length - 1].accion == 'modificar') {
            
            this.actualizarData();
            this.data[this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data)] = this.deshacer_acciones[this.deshacer_acciones.length - 1].datos;
            this.data[this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data)].tabla_control.modificado = false;


            for (var i = 0; i < this.campos.length; i++) {
                this.setValor(this.campos[i].nombreCampo,
                         this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data),
                         this.deshacer_acciones[this.deshacer_acciones.length - 1].datos[this.campos[i].nombreCampo]);
            }

            this.deshacer_acciones.splice(this.deshacer_acciones.length - 1, 1);

            this.data.shift();
            this.mostrar_tabla(this);

            this.actualizarData();
        }
        else if (this.deshacer_acciones[this.deshacer_acciones.length - 1].accion == 'agregar') {
            tabla.deleteRow(this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data));
            this.data.splice(this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data), 1);
            this.cantFilas--;
            this.deshacer_acciones.splice(this.deshacer_acciones.length - 1, 1);
            this.actualizarData();
        }
        else if (this.deshacer_acciones[this.deshacer_acciones.length - 1].accion == 'ordenModificado') {
            this.swap(this.deshacer_acciones.getFila(this.deshacer_acciones[this.deshacer_acciones.length - 1].fila, this.data), this.deshacer_acciones[this.deshacer_acciones.length - 1].columna, this.deshacer_acciones[this.deshacer_acciones.length - 1].orden);
            this.deshacer_acciones.splice(this.deshacer_acciones.length - 1, 1);
        }
        else if (this.deshacer_acciones[this.deshacer_acciones.length - 1].accion == 'orden') {

            this.ordenar(this.deshacer_acciones[this.deshacer_acciones.length - 1].cabecera,
                this.deshacer_acciones[this.deshacer_acciones.length - 1].tipo == 'DESC' ? 'ASC' : 'DESC',
                this.deshacer_acciones[this.deshacer_acciones.length - 1].nro_campo_tipo,
                true);
            this.deshacer_acciones.splice(this.deshacer_acciones.length - 1, 1);
        }
    }

    this.deshacer_acciones.getFila = function (row_index, data) {
        for(var i = 1 ; i < data.length; i ++) {
            if(data[i].tabla_control.idPermanente == row_index)
                return i;
        }
        return -1;
    } 

}
