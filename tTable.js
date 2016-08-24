/**
 * Description
 * @method tTable
 * @param {} nombreTabla
 * @param {} filtroXML
 * @param {} cabeceras
 * @param {} campos
 * @param {} callbackValidacion
 * @param {} callbackEliminar
 * @param {} callbackModificar
 * @param {} backgroundColorCallback
 * @param {} callbackOnComplete
 * @return 
 */
function tTable(nombreTabla, filtroXML, cabeceras, campos, callbackValidacion, callbackEliminar, callbackModificar, backgroundColorCallback, callbackOnComplete) {

    var table = this;
    this.nombreTabla = nombreTabla
    this.cabeceras = cabeceras;
    this.campos = campos;
    this.filtroXML = filtroXML;
    this.filtroWhere = '';
    this.radioSeleccionadoCampo = "";
    this.filas = 0;
    this.columnas = 0;
    this.async = false;
    this.height = 100 + 'px';
    this.editable = true;
    this.eliminable = true;
    this.tBody = {};
    this.tBody.style = "";
    this.tHeader = {};
    this.tHeader.style = "width:100%;";
    this.mostrarAgregar = true;
    //Color celdas
    this.color1 = '#FFFFFF';
    this.color2 = '#F4F4F4';
    this.data = [];

    this.table_load_html = table_load_html; //Genera e inserta el codigo HTML que dibuja el control

    this.agregar_espacios_en_blanco_dir = agregar_espacios_en_blanco_dir;

    //Metodos del tTable
    this.validar = validar;
    this.getFila = getFila;
    this.modificar_fila = modificar_fila;
    this.generarXML = generarXML;
    this.funcionRadioButtonTable = funcionRadioButton;
    this.funcionCheckBox = funcionCheckBox;
    this.existenRadioButton = existenRadioButton;
    this.actualizarRadiobutton = actualizarRadiobutton;
    this.getCelda = getCelda;
    this.indexReal = indexReal;
    this.disableColumns = disableColumns;
    this.refresh = refresh;
    this.addOnComplete = addOnComplete;
    this.onComplete = onComplete;
    this.async = true;


    //Variable de control
    this.tabla_control = []
    var modifiedValues = [];
    var tablas = [];
    this.agregar_fila = agregar_fila;
    this.eliminar_fila = eliminar_fila;
    this.funcionesOnComplete = [];
    var lista_rs;

    this.getValor = getValor;
    this.setValor = setValor;
    this.modCelda = modCelda;

    //Metodos definidos por el usuario
    this.eliminar = callbackEliminar ? callbackEliminar : function (fila) { };
    this.modificar = callbackModificar ? callbackModificar : function (fila) { };
    this.validacion = callbackValidacion ? callbackValidacion : function (fila) {
        //validacion por defecto
        for (var index_colum = 0; index_colum < this.columnas; index_colum++) {
            if (!this.admiteNulo(this.campos[index_colum]) &&
                !this.campos[index_colum].radioButton &&
                !this.campos[index_colum].checkBox &&
                fila[this.campos[index_colum].nombreCampo] == "" &&
                this.campos[index_colum].editable === undefined) {

                return false;
            }
        }

        return true;
    };
    this.estilo = backgroundColorCallback ? backgroundColorCallback :

        function (fila) {
            /*
            if (fila.style.display == 'none') return;
            var colorPintar = this.indexReal(fila.rowIndex) % 2 ? this.color1 : this.color2;

            //Coloreamos la fila
            for (var index = 0; index < fila.cells.length; index++) {
                fila.cells[index].style.backgroundColor = colorPintar;
            }

            return true;*/
        };

    //this.tabla_ids = [];

    /**
     * Description
     * @method admiteNulo
     * @param {} campo
     * @return Literal
     */
    this.admiteNulo = function (campo) {
        if (campo.nulleable)
            return true;

        return false;
    }

    /**
     * Description
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
     * @method default_get_campo
     * @param {} nombreTabla
     * @param {} id
     * @param {} nro_campo_tipo
     * @param {} enDB
     * @return 
     */
    function default_get_campo(nombreTabla, id, nro_campo_tipo, enDB) {
        //var id = '_fila_' + row_index + '_columna_' + index_cell
        this.nro_campo_tipo = this.nro_campo_tipo ? this.nro_campo_tipo : 104;
        this.enDB = this.enDB ? this.enDB : false;

        campos_defs.add(nombreTabla + "_campos_defs" + id, {
            nro_campo_tipo: this.nro_campo_tipo
            , enDB: this.enDB
            , target: 'campos_tb_' + nombreTabla + id
        });
    }


    /**
     * Description
     * @method agregar_fila
     * @param {} valores_campos
     * @return 
     */
    function agregar_fila(valores_campos) {
        var table = $('campos_tb_' + this.nombreTabla);
        table.deleteRow(table.rows.length - 1);
        var row = table.insertRow(table.rows.length);
        row.id = 'campos_tb_' + this.nombreTabla + '_fila_' + this.filas;

        var celdas = [];
        var index_cell = 0;

        //Definimos la funcion de generacion del campo
        
        for (; index_cell < this.campos.length; index_cell++) {
            celdas[index_cell] = row.insertCell(index_cell);
            valores_campos[index_cell].fila = this.filas;
            celdas[index_cell].id = 'campos_tb_' + this.nombreTabla + '_fila_' + this.filas + '_columna_' + index_cell

            if (valores_campos[this.columnas] && !valores_campos[this.columnas + 1]) {
                if (this.campos[index_cell].get_html) {

                    celdas[index_cell].innerHTML = this.campos[index_cell].get_html(valores_campos[index_cell], this.nombreTabla, valores_campos);
                } else {

                    celdas[index_cell].innerHTML = valores_campos[index_cell].valor;

                }

                if (this.campos[index_cell].id) {
                    celdas[index_cell].idCampo = valores_campos[index_cell].id;
                }


            } else {
                
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

                    celdas[index_cell].innerHTML = this.campos[index_cell].get_campo({
                        fila: this.filas
                    }, this.nombreTabla);

                } else {
                    //Verificiamos que exista la funcion get_Campo

                    this.campos[index_cell].get_campo = this.campos[index_cell].get_campo ?
                        this.campos[index_cell].get_campo :
                        default_get_campo;
                    var esEditable = this.campos[index_cell].editable === undefined || this.campos[index_cell].editable === true;
                    if (esEditable) {

                        this.campos[index_cell].get_campo(this.nombreTabla, '_fila_' + this.filas + '_columna_' + index_cell);
                        if (this.campos[index_cell].valorDefecto)
                            campos_defs.set_value(this.nombreTabla + "_campos_defs" + '_fila_' + this.filas + '_columna_' + index_cell, this.campos[index_cell].valorDefecto);
                        if (valores_campos[index_cell].valor && valores_campos[index_cell].valor != "") {
                            campos_defs.set_value(this.nombreTabla + "_campos_defs" + '_fila_' + this.filas + '_columna_' + index_cell, valores_campos[index_cell].valor);
                        }
                    }
                    else {
                        celdas[index_cell].innerHTML = this.campos[index_cell].get_html(valores_campos[index_cell], this.nombreTabla, valores_campos);
                    }


                }
            }


            //Establecemos el ancho de la columna
            //if (this.campos[index_cell].width)
            //    celdas[index_cell].style.width = this.campos[index_cell].width;
            //alinear
            if (this.campos[index_cell].align)
                celdas[index_cell].style.textAlign = this.campos[index_cell].align;



        }

        //Agregamos los botones basicos
        //Borrar
        if (this.eliminable) {
            celdas[index_cell] = row.insertCell(index_cell);
            celdas[index_cell].id = 'campos_tb_' + this.nombreTabla + '_fila_' + this.filas + '_columna_' + (index_cell)
            celdas[index_cell].innerHTML = '<center><img border="0"  onclick="' + this.nombreTabla + '.eliminar_fila(\'' + this.filas + '\')" src="/FW/image/icons/eliminar.png" title="eliminar" style="cursor:pointer" /></center>';
            //celdas[index_cell].style.width = "12.5%";
            celdas[index_cell].style.align = "center";

            index_cell++;
        }


        //Modificar
        //En caso de que sea nuevo no va el boton modificar
        if (this.editable) {
            if (valores_campos[this.columnas]) {
                celdas[index_cell] = row.insertCell(index_cell);
                celdas[index_cell].id = 'campos_tb_' + this.nombreTabla + '_fila_' + (this.filas - 1) + '_columna_' + (index_cell)
                celdas[index_cell].innerHTML = '<center><img border="0" onclick="' + this.nombreTabla + '.modificar_fila(\'' + this.filas + '\')"src="/FW/image/icons/editar.png" title="editar" style="cursor:pointer"/></center>';
                //celdas[index_cell].style.width = "12.5%";
                celdas[index_cell].style.align = "center";
            } else {
                celdas[index_cell] = row.insertCell(index_cell);
            }
        }

        //Agregamos valores oculos de control
        /*this.tabla_control.push({
            existeEnBd: valores_campos[this.columnas]
            , modificado: valores_campos[this.columnas + 1]
            , eliminado: valores_campos[this.columnas + 2]
        });*/

        if (!this.data[this.filas]) this.data[this.filas] = {};
        this.data[this.filas].tabla_control = {
            existeEnBd: valores_campos[this.columnas]
            , modificado: valores_campos[this.columnas + 1]
            , eliminado: valores_campos[this.columnas + 2]
        }

        if (this.data[this.filas].tabla_control.eliminado)
            this.eliminar_fila(this.filas)

        this.filas++;

        this.estilo(row);

        var row = table.insertRow(table.rows.length);

        //var cell1 = row.insertCell(0);
        //cell1.colSpan = index_cell+1;
        //cell1.innerHTML = '<center><img border="0" onclick="' + this.nombreTabla + '.agregar_espacios_en_blanco_dir()" src="/FW/image/icons/agregar.png" title="editar" style="cursor:pointer"/></center>';


        campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);

    }

    /**
     * Description
     * @method agregar_espacios_en_blanco_dir
     * @return 
     */
    function agregar_espacios_en_blanco_dir() {
        var row_index = 0
            , cell_index = 0;
        var valores_campos = [];
        for (cell_index = 0; cell_index < this.campos.length; cell_index++) {
            if (this.indexReal(this.filas) == 1 && this.campos[cell_index].radioButton) {
                valores_campos[cell_index] = {
                    valor: true
                    , columna: cell_index
                    , fila: this.filas
                };
            } else {
                valores_campos[cell_index] = "";
            }
            if (this.campos[cell_index].checkBox)
                valores_campos[cell_index] = {
                    valor: true
                    , columna: cell_index
                    , fila: this.filas
                }
        }

        //Determina si el valor viene de la base de datos

        valores_campos[cell_index] = false;
        //Determina si el valor fue modificado
        valores_campos[cell_index + 1] = false;
        //Determina si el valor fue eliminado
        valores_campos[cell_index + 2] = false;


        this.agregar_fila(valores_campos);
        this.disableColumns(columnasADeshabilitar, estadoDeshabilitar);

        this.resize()
        //campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);
    }


    /**
     * Description
     * @method eliminar_fila
     * @param {} row_index
     * @return 
     */
    function eliminar_fila(row_index) {

        if (this.tieneRadiobuttonSeleccionado(row_index)) {
            alert("No se puede eliminar una fila activa");
        } else {


            this.data[row_index].tabla_control.eliminado = true;
            var tabla = $('campos_tb_' + this.nombreTabla);
            var fila = tabla.rows[row_index];
            if (this.data[row_index].tabla_control.existeEnBd) {
                this.eliminar(this.getFila(row_index));
            }

            //Ocultamos la fila que se va a eliminar

            fila.style.display = fila.style.display === 'none' ? 'table-row' : 'none';

            //fila.style.visibility = "hidden";
            //colBody.childElements()[i]
            //Coloreamos las filas siguientes a la que se borro.
            /*var row;

            for (var index = parseInt(row_index) + 1; tabla.rows.length - 1 > index; index++) {
                row = tabla.rows[index];
                this.estilo(row);
            }*/

            //campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);
            this.resize()


            //Coloreamos la fila que se borro.
            /*for (var index = 0; index < fila.cells.length; index++) {
            fila.cells[index].style.backgroundColor = '#F08080';
            }*/
        }
    }

    /**
     * Description
     * @method tieneRadiobuttonSeleccionado
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
     * @method modificar_fila
     * @param {} row_index
     * @return 
     */
    function modificar_fila(row_index) {

        //Variables auxiliares
        
        var index_cell = 0;
        var fila = $('campos_tb_' + this.nombreTabla).rows[row_index];
        var esUnCampoDef = campos_defs.items[nombreCampoDef] ? true : false;

        for (; index_cell < this.columnas; index_cell++) {
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
                modifiedValues[nombreCampoDef] = valor;
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
        this.data[row_index].tabla_control.modificado = true;
        //En caso de que tenga una callBack.. por defecto es vacio.
        this.modificar(this.getFila(row_index));
        //fila.style.display = fila.style.display === 'none' ? 'table-row' : 'none';
        this.disableColumns(columnasADeshabilitar, estadoDeshabilitar);

    }


    /**
     * Description
     * @method getCelda
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

        if (esUnRadiobutton || esUnCheckBox) {

            fila_objeto[nombreCampo] = celda.firstChild.checked;
        } else {
            //Revisamos si es un campo def
            if (esUnCampoDef) {
                fila_objeto[nombreCampo] = campos_defs.get_value(nombreCampoDef);

            } else {
                if (this.columnas > index_cell)
                    fila_objeto[nombreCampo] = celda.innerText;
            }
        }


        return fila_objeto;
    }

    /**
     * Description
     * @method getFila
     * @param {} row_index
     * @return fila_objeto
     */
    function getFila(row_index) {

        var fila = $('campos_tb_' + this.nombreTabla).rows[row_index];
        fila_objeto = {};

        for (var index_cell = 0; index_cell < this.columnas; index_cell++) {
            fila_objeto = this.getCelda(fila.cells[index_cell], fila_objeto, row_index, index_cell)
        }
        //valores de control
        fila_objeto.indice = row_index;
        fila_objeto.existeEnBd = this.data[row_index].tabla_control.existeEnBd;
        fila_objeto.modificado = this.data[row_index].tabla_control.modificado;
        fila_objeto.eliminado = this.data[row_index].tabla_control.eliminado;

        return fila_objeto;
    }

    /**
     * Description
     * @method existenRadioButton
     * @return Literal
     */
    function existenRadioButton() {
        for (var index_colum = 0; index_colum < this.columnas; index_colum++) {
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
                for (var row_index = 1; row_index < this.filas; row_index++) {
                    fila = this.getFila(row_index);
                    //si el radio esta checkeado y es diferente al inicial
                    if (fila[this.campos[seleccionado.columna].nombreCampo] == true && (seleccionado.fila) != fila.indice) {
                        this.data[fila.indice].tabla_control.modificado = true;
                        this.data[seleccionado.fila].tabla_control.modificado = true;

                    }
                }
            } else {
                for (var row_index = 1; row_index < this.filas; row_index++) {
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
     * @method validar
     * @return Literal
     */
    function validar() {
        var resultado = true;

        for (var row_index = 1; row_index < this.filas; row_index++) {
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
     * @method generarXML
     * @param {} tag
     * @return strXML
     */
    function generarXML(tag) {

        this.actualizarRadiobutton();

        var strXML = "";

        //{ existeEnBd: valores_campos[this.columnas], modificado: valores_campos[this.columnas + 1], eliminado: valores_campos[this.columnas + 2] }
        for (var row_index = 1; row_index < this.filas; row_index++) {
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
                if (fila.existeEnBd && fila.modificado) {
                    strXML += "<" + tag + " accion=";
                    strXML += "'modificar'"
                    strXML += this.obtenerValoresXML(fila);
                    strXML += " />"
                }
            }
        }


        return strXML;
    }

    //Retorna los valores de cada fila en formato XML
    /**
     * Description
     * @method obtenerValoresXML
     * @param {} fila
     * @return valoresXML
     */
    this.obtenerValoresXML = function obtenerValoresXML(fila) {
        var valoresXML = " "
        var aux;

        for (var index_colum = 0; index_colum < this.columnas; index_colum++) {
            var campoNombre = this.campos[index_colum].nombreCampo;
            var campoId = this.campos[index_colum].id;
            var esUnRadioButton = this.campos[index_colum].radioButton;
            aux = modifiedValues[this.nombreTabla + "_campos_defs" + '_fila_' + fila.indice + '_columna_' + index_colum];
            aux = aux ? aux : fila[campoNombre];

            if (esUnRadioButton) {
                valoresXML += campoNombre + "='";
                valoresXML += fila[campoNombre] ? "1" : "0";
                valoresXML += "' "
            } else {
                valoresXML += campoNombre + "='" + fila[campoNombre] + "' ";
                valoresXML += campoNombre + "Anterior='" + aux + "' ";
            }

            if (campoId) {
                valoresXML += campoId + "='" + fila[campoId] + "' ";
            }

        }

        return valoresXML;

    }

    /**
     * Description
     * @method funcionRadioButton
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



    /**
     * Description
     * @method click_check
     * @param {} fila
     * @return 
     */
    this.click_check = function (fila) {

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

        if (check.valor == true)
            stringCheck += 'true" checked>';
        else
            stringCheck += 'false">';
        //
        var strHtml = '<input type="checkbox" onclick="' + nombreTabla + '.click_check(' + check.fila + ')" name="vehicle" value="' + stringCheck;

        return strHtml;
    }

    /**
     * Description
     * @method indexReal
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

    var columnasADeshabilitar = [];
    var estadoDeshabilitar = false;

    /**
     * Description
     * @method disableColumns
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
                            campos_defs.habilitar(celda.firstChild.id.substr(12, celda.firstChild.id.length), !estado)
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
     * @method validarRadioButtonSeleccionado
     * @param {} nombreCampo
     * @return Literal
     */
    this.validarRadioButtonSeleccionado = function (nombreCampo) {
        var contador = 0;
        //
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

    /**
     * Description
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
            }
        }
    }
    /**
     * Description
     * @method ordenar
     * @param {} cabecera
     * @param {} tipo
     * @param {} nro_campo_tipo
     * @return 
     */
    this.ordenar = function (cabecera, tipo, nro_campo_tipo) {

        if (this.validar()) {

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
                    if(!v1)
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
            } else {
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
        } else {
            alert("Los valores a ordenar son invalidos");
        }
    }

    /**
     * Description
     * @method table_load_html_ascy
     * @param {} tabla
     * @return 
     */
    this.table_load_html_ascy = function (tabla) {

        tabla.columnas = 0;
        tabla.filas = 0;
        tabla.radioSeleccionadoCampo = "";
        //tabla.tabla_control = [];

        //tabla = this;
        var rs = new tRS();
        //

        //Para uso ascincronico
        if (!lista_rs)
            lista_rs = [];


        lista_rs[tabla.nombreTabla] = rs;
        rs.async = true;
        nvFW.bloqueo_activar($(tabla.nombreTabla), 'cargando-' + tabla.nombreTabla);
        /**
         * Description
         * @method onComplete
         * @return 
         */
        rs.onComplete = function () {
            tabla.data = [];
            while (!lista_rs[tabla.nombreTabla].eof()) {
                var fila = {};
                for (var index_campos = 0; index_campos < tabla.campos.length; index_campos++) {

                    fila[tabla.campos[index_campos].nombreCampo] = rs.getdata(tabla.campos[index_campos].nombreCampo);
                    if (tabla.campos[index_campos].id) {

                        fila[tabla.campos[index_campos].id] = rs.getdata(tabla.campos[index_campos].id);
                    }
                }
                fila.tabla_control = {};
                tabla.data.push(fila);

                rs.movenext();
            }


            tabla.mostrar_tabla(tabla);


            nvFW.bloqueo_desactivar($(tabla.nombreTabla), 'cargando-' + tabla.nombreTabla);
            //Lanza el metodo onComplete en caso de estar definido.
            tabla.onComplete(tabla);
        }

        rs.open(tabla.filtroXML, '', tabla.filtroWhere, '', '');

    }

    /**
     * Description
     * @method table_load_html_sync
     * @param {} tabla
     * @return 
     */
    this.table_load_html_sync = function (tabla) {

        this.columnas = 0;
        this.filas = 0;
        this.radioSeleccionadoCampo = "";
        this.tabla_control = [];

        if (!lista_rs)
            lista_rs = [];



        var rs = new tRS();
        lista_rs[tabla.nombreTabla] = rs;


        rs.open(this.filtroXML, '', this.filtroWhere, '', '');
        tabla.mostrar_tabla(tabla);

    }

    /**
     * Description
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
            $("div_boton_" + tabla.nombreTabla).display = "none";
            $("div_boton_" + tabla.nombreTabla).innerHTML = '';
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

        /*
        var tabla = this;

        var altura_tabla_boton = 10;


        var div_tabla = $(tabla.nombreTabla);

        var div_titulos = $("div_titulos_" + tabla.nombreTabla);
        var header_table = $("header_tbl_" + tabla.nombreTabla);

        var altura_tabla_titulo = header_table.getHeight() > 20 ? header_table.getHeight() : 20;
        //var ancho_tabla_titulo = header_table.getWidth();
        var altura_tabla = div_tabla.getHeight();


        var altura_tabla_cuerpo = (altura_tabla - altura_tabla_boton - altura_tabla_titulo - 2);


        div_titulos.style.height = altura_tabla_titulo + "px";
        var div_boton = $("div_boton_" + tabla.nombreTabla);
        div_boton.style.height = altura_tabla_boton + "px";
        var div_cuerpo = $("div_cuerpo_" + tabla.nombreTabla);
        //var scrollWidth = divBody.getWidth() - tbBodyWidth
        div_cuerpo.style.height = altura_tabla_cuerpo > 0 ? altura_tabla_cuerpo + "px" : "0px";
        //if (ancho_tabla_titulo < 400)
        //$("campos_tb_" + this.nombreTabla).style.width = "100%";

        campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);*/
    }

    /**
     * Description
     * @method mostrar_tabla
     * @param {} tabla
     * @return 
     */
    this.mostrar_tabla = function (tabla) {
        this.removeCamposDef();

        tabla.filas = 1;
        tabla.columnas = 0;
        /*tabla.tabla_control.push({
            existeEnBd: 0
            , modificado: 0
            , eliminado: 0
        });*/
        var fila = {};
        fila.tabla_control = {};
        fila.tabla_control = {
            existeEnBd: 0
            , modificado: 0
            , eliminado: 0
        }
        tabla.data.unshift(fila);

        var srtHtml =
            '<div style="width:100%;height:100%;overflow:hidden;background-color:white;">' +



            '<div style="overflow:hidden;" id="div_titulos_' + tabla.nombreTabla + '" >' +
            '<table  style="' + tabla.tHeader.style + '"  id="header_tbl_' + tabla.nombreTabla + '" >  ' +
            '<tr class="tbLabel">';

        for (col_index = 0; col_index < tabla.cabeceras.length; col_index++) {
            //Cargamos valor por defecto campos de tipo texto.
            tabla.campos[col_index].nro_campo_tipo = tabla.campos[col_index].nro_campo_tipo ? tabla.campos[col_index].nro_campo_tipo : '104';
            var ordenHTML = '';
            //Valores de control 
            var tieneGetHtml = tabla.campos[col_index].get_html ? true : false;
            var tieneCheckbox = tabla.campos[col_index].checkBox ? true : false;
            var tieneRadioButton = tabla.campos[col_index].radioButton ? true : false;
            var esOrdenable = (tabla.campos[col_index].ordenable === undefined) ? true : false;


            if (tabla.campos[col_index].ordenable === true || (!tieneGetHtml && !tieneCheckbox && !tieneRadioButton && esOrdenable)) {
                ordenHTML = '<img src="/FW/image/icons/up_a.png" onclick="return ' + tabla.nombreTabla + '.ordenar( \'' + tabla.campos[col_index].nombreCampo + '\' ,\'ASC\',\'' + tabla.campos[col_index].nro_campo_tipo + '\')"></img>' +
                '<img  src="/FW/image/icons/down_a.png" onclick="return ' + tabla.nombreTabla + '.ordenar( \'' + tabla.campos[col_index].nombreCampo + '\',\'DESC\',\'' + tabla.campos[col_index].nro_campo_tipo + '\' )"></img>'
            }
            srtHtml += '<td style="text-align: center;width:' + tabla.campos[col_index].width + ';">' +
                 ordenHTML +
                tabla.cabeceras[col_index] + '</td>';
            tabla.columnas++
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
        table.className = "tb1 highlightEven highlightTROver scroll "

        //Agrego una fila invisible

        //var row_invisible = table.insertRow(table.rows.length);
        //var columnas = tabla.columnas;
        //columnas += tabla.eliminable ? 1 : 0;
        //columnas += tabla.editable ? 1 : 0;
        //var cell1 = row_invisible.insertCell(0);
        //cell1.colSpan = columnas;
        //cell1.style.height = "1px";


        var row = table.insertRow(table.rows.length);
        //campos_head.resize("header_tbl_" + this.nombreTabla, "campos_tb_" + this.nombreTabla);


        var filas_aux = 0;

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

            tabla.agregar_fila(valores_campos);

        }

        tabla.resize();

    }

    /**
     * Description
     * @method addOnComplete
     * @param {} f
     * @return 
     */
    function addOnComplete(f) {
        this.funcionesOnComplete.push(f);
    }

    /**
     * Description
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
     * @method setValor
     * @param {} nombreCampo
     * @param {} row_index
     * @param {} valor
     * @return 
     */
    function setValor(nombreCampo, row_index, valor) {

        var fila = $('campos_tb_' + this.nombreTabla).rows[row_index];
        for (var index_cell = 0; index_cell < this.columnas; index_cell++) {
            if (this.campos[index_cell].nombreCampo == nombreCampo) {
                this.modCelda(fila.cells[index_cell], fila_objeto, row_index, index_cell, valor);
                break;
            }
        }
    }

    /**
     * Description
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
                if (this.columnas > index_cell)
                    celda.innerText = valor;
            }
        }
    }

    /**
     * Description
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

}
