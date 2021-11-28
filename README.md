# GCO-P3

## Introducción y objetivos
Esta práctica tiene como objetivo implementar un sistema de recomendación que permita predecir el interés de un conjunto de usuarios por ítems que no han consumido aún. Para ello se emplea una matriz de utilidad que será rellenada haciendo uso de técnicas de filtrado colaborativo: Se emplearán distintas métricas para evaluar la similitud entre usuarios, llenando así una matriz de similitud que nos permitirá realizar la predicción en conjunto con las valoraciones del resto de usuarios.

## Página HTML e inicialización Javascript
El sistema recomendador se ha implementado haciendo uso de Javascript. Para cargar los valores de entrada y visualizar los resultados, se emplea una página con la siguiente estructura HTML:

~~~html
<html>
    <head>
        <title>Sistema Recomendador</title>
        <meta charset="utf-8">
        <link rel="stylesheet" href="../styles/style.css">
    </head>
    <body>
        <h1>Sistema recomendador</h1>
        <h2>Introduzca los siguientes datos:</h2>
        <form>
            <p>Introduzca la matriz</p>
            <input type="file" id="matrixFile">

            <p>Seleccione la métrica</p>
            <select id="metric">
                <option selected value=1>Pearson</option>
                <option value=2>Distancia coseno</option>
                <option value=3>Distancia euclídea</option>
            </select>

            <p>Seleccione el número de vecinos</p>
            <input type="number" id="neighbors" value=1>

            <p>Seleccione el tipo de predicción</p>
            <select id="prediction">
                <option selected value=1>Simple</option>
                <option value=2>Diferencia con la media</option>            
            </select>

            
            <br>
            <br>
            
            <button type="button" id="btnAccept">Aceptar</button>
            
            <br>
            <br>

            <div id="outputOriginal"></div>
            <div id="outputSimilar"></div>
            <div id="outputComplete"></div>
        </form>
        <script type="text/javascript" src="../script/main.js"></script>
    </body>
</html>
~~~

El formulario contenido en la página permite seleccionar los siguientes parámetros
* Matriz, un campo input de tipo file permite cargar un fichero txt que contenga la matriz de utilidad desde el equipo
* Métrica (Pearson, distancia coseno o distancia euclídea)
* Número de vecinos (Cuyo valor se encuentra entre 1 y Nvecinos -1)
* Método para calcular la predicción (Simple o Diferencia con la media)

Una vez seleccionados los valores deseados se inicia el proceso haciendo click en el botón etiquetado con id btnAccept.

Tras ejecutar las funciones definidas en el fichero javascript para completar la matriz de utilidad, los resultados se cargan en los correspondientes div, mostrando así la matriz original, la matriz de similitud, y la matriz de utilidad completa. Esta información es representada siguiendo el formato de tabla de HTML.

La siguiente función de javascript se ejecuta de forma automática cuando se carga el contenido de la página:

~~~javascript
document.addEventListener("DOMContentLoaded", (_) => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        let matrix = [];
        let valid = false;
        document.getElementById('matrixFile').addEventListener('change', (e) => {
            readMatrixFile(e).then((r) => {
                if(r.length <= 1){
                    alert("ERROR: El número de filas es igual o menor a 1")
                    matrix = [];
                    valid = false;
                } else {
                    matrix = [...r];
                    valid = true;   
                }
            }).catch((err) => {
                alert(err);
                matrix = [];
                valid = false;
            });
        });

        document.getElementById('neighbors').addEventListener('change', (e) => {
            if(valid === true){
                if(e.srcElement.valueAsNumber < 1 || e.srcElement.valueAsNumber > matrix.length -1){
                    e.srcElement.valueAsNumber = 1;
                }
            }
        })

        document.getElementById('btnAccept').addEventListener('click', (_) => {
            if(valid === false){
                alert("Por favor, introduzca una matriz válida para continuar");
            } else {
                calculateMatrix(matrix, document.getElementById('metric').value, document.getElementById('neighbors').valueAsNumber, document.getElementById('prediction').value)
            }
        });

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
});
~~~

La función define una serie de manejadores para los siguientes eventos:
* Actualizar el contenido del campo matrixFile del formulario, es decir, subir un archivo .txt al formulario con el contenido de la matriz. Ante este evento se invoca una función que lee el contenido del fichero y lo devuelve en formato de matriz de arrays anidados (matrix[i][j]). Acto seguido se realizan comprobaciones sobre la misma y, en caso de ser válida, actualiza el valor booleano valid a True.
* Actualizar el campo de número de vecinos. Si el valor introducido es menor que uno o mayor que Nvecinos -1, cambia automáticamente el valor del campo a 1.
* Hacer click sobre el botón btnAccept, en cuyo caso invoca a la función calculateMatrix en caso de que el valor del booleano valid sea True (la matriz cargada es válida). La función calculateMatrix inicia el proceso de compleción de la matriz de utilidad.

La función que permite leer y transformar la matriz desde un fichero de texto plano es la siguiente:

~~~javascript
async function readMatrixFile(e){
    return new Promise((resolve, reject) => {
        if(e.target.files[0].type != 'text/plain'){
            reject("FORMATO NO VÁLIDO")
        } else {
            let aux1 = [], aux2 = [];
            fr = new FileReader();
            fr.readAsText(e.target.files[0]);
            fr.onloadend = function() {
                aux1 = [...this.result.split("\n")];
                aux1.forEach((e) => {
                    if(e !== ""){
                        aux2.push(e.split(" "));
                    }
                });
                aux1 = [];
                aux2.forEach((e) => {
                    let line = []
                    e.forEach((x) => {
                        if(x !== ""){
                            line.push(x);
                        }
                    })
                    aux1.push(line);
                });
                resolve(aux1);
            }
        }
    });
}
~~~

Esta función devuelve la matriz en formato de arrays anidados si la carga del fichero si no ocurre ningún error durante la carga, lectura, y transformación del contenido del fichero. En caso contrario devuelve una cadena con el tipo de error.


La función que permite completar la matriz de utilidad es la siguiente:

~~~javascript
function calculateMatrix(matrix, method, neighbors, prediction) {
    let modifiedMatrix = [];
    modifiedMatrix.length = matrix.length;
    for (let i = 0; i < matrix.length; i++){
        modifiedMatrix[i] = [...matrix[i]];
    }

    let sim = generateSimilaritiesMatrix(modifiedMatrix, method);
    switch (Number(prediction)) {
        case 2:
            avgPrediction(modifiedMatrix, sim, neighbors, method)    
        break;
        default:
            simpPrediction(modifiedMatrix, sim, neighbors, method);
        break;
    }

    loadContent(document.getElementById("outputOriginal"), "Matriz original", matrix);
    loadContent(document.getElementById("outputSimilar"), "Matriz de similitudes", sim);
    loadContent(document.getElementById("outputComplete"), "Matriz completa", modifiedMatrix);
}
~~~

En esta función se copia el contenido de la matriz original en una nueva matriz que será modificada. Se invoca a la función generateSimilaritiesMatrix para obtener la matriz de similitud, y a las funciones avgPrediction y simpPrediction para completar la matriz de utilidad según una predicción simple o diferencia con la media. 

La función loadContent permite cargar una matriz en el árbol DOM transformándola al formato de tabla de HTML:

~~~javascript
function loadContent(env, title, matrix){
    let auxstr = "<h3>" + title + "</h3>";
    auxstr += "<table>";
    for (let i = 0; i < matrix.length; i++) {
        auxstr += "<tr>";
        for (let j = 0; j < matrix[i].length; j++) {
            auxstr += "<th>" + String(matrix[i][j]) + "</th>";
        }
        auxstr += "</tr>";
    }
    auxstr += "</table>";


    env.innerHTML = auxstr;
}
~~~
## Cálculo de la matriz de similitud
Para evaluar la similitud entre usuarios, se rellena una matriz de mxm, dónde tanto las filas como las columnas corresponden a los usuarios presentes en el sistema, y una posición de la matriz (i, j), corresponde a la similitud entre el usuario asociado a la fila i y el usuario asociado a la columna j. 

Dada la naturaleza de esta matriz, la similitud sim(i, j) es idéntica a la similitud sim(j, i), pues el resultado de evaluar la similitud entre, por ejemplo, el usuario 0 y el usuario 1, será el mismo que el de evaluar la similitud entre el usuario 1 y el usuario 0. Además, no se debería tener en cuenta los valores de la diagonal, pues estos valores se corresponden a la similitud de un usuario consigo mismo. 

Por ello, a la hora de implementar la función que calcula la matriz de similitud solo ha sido necesario calcular la triangular inferior de la matriz, copiando cada valor en la posición correspondiente de la triangular superior. Además, se han asignado a las posiciones de la diagonal el valor -999 para que sean posteriormente ignorados, a la hora de evaluar qué vecinos tienen mayor similitud con respecto a un usuario.

~~~ javascript
function generateSimilaritiesMatrix(matrix, method) {
    result = [];
    matrix.forEach((_) => {result.push([])});
    result.forEach((e) => {e.length = matrix.length; e.fill(-1)});
    for(let i = 0; i < result.length; i++) {
        result[i][i] = -999;
    }
    for(let i = 0; i < result.length; i++) {
        for(let j = 0; j < result[i].length; j++) {
            if(j >= i){
                break;
            }
            result[i][j] = obtainSimilarityIndex(matrix, i, j, method);
            result[j][i] = result[i][j];
        }
    }
    return result;
}
~~~

Para obtener el índice de similitud se han empleado 3 métricas diferentes:

~~~javascript
function obtainSimilarityIndex(matrix, i, j, method){
    switch (Number(method)) {
        case 2:
            return cosDistance(matrix, i, j);
            break;
        case 3:
            return euclidean(matrix, i, j);
            break;
        default:
            return pearson(matrix, i, j);
            break;
    }
}
~~~

### Correlación de Pearson
~~~javascript
function pearson(matrix, u, v) {
    let Suv = [];
    for(let i = 0; i < matrix[0].length; i++) {
        if(matrix[u][i] !== "-" && matrix[v][i] !== "-"){
            Suv.push(i);
        }
    }
    if(Suv.length == 0){
        return 0;
    }
    let t1 = 0, t2 = 0, t3 = 0;
    for(let i = 0; i < Suv.length; i++) {
        t1 += (Number(matrix[u][Suv[i]]) - arrayAvg(matrix[u]))*(Number(matrix[v][Suv[i]]) - arrayAvg(matrix[v]));
        t2 += Math.pow((Number(matrix[u][Suv[i]]) - arrayAvg(matrix[u])), 2);
        t3 += Math.pow((Number(matrix[v][Suv[i]]) - arrayAvg(matrix[v])), 2);
    }
    t2 = Math.sqrt(t2);
    t3 = Math.sqrt(t3);
    return t1/(t2*t3);
}
~~~

Devuelve un índice de correlación entre 0 y 1, dónde:
* 1 - Correlación directa perfecta
* 1 / 0 - Correlación directa
* 0 - Sin correlación
* 0 / -1 - Correlación inversa
* -1 - Correlación inversa perfecta
### Distancia coseno
~~~javascript
function cosDistance(matrix, u, v) {
    let Suv = [];
    for(let i = 0; i < matrix[0].length; i++) {
        if(matrix[u][i] !== "-" && matrix[v][i] !== "-"){
            Suv.push(i);
        }
    }
    if(Suv.length == 0){
        return 0;
    }
    let t1 = 0, t2 = 0, t3 = 0;
    for(let i = 0; i < Suv.length; i++) {
        t1 += (Number(matrix[u][Suv[i]]))*(Number(matrix[v][Suv[i]]));
        t2 += Math.pow((Number(matrix[u][Suv[i]])), 2);
        t3 += Math.pow((Number(matrix[v][Suv[i]])), 2);
    }
    t2 = Math.sqrt(t2);
    t3 = Math.sqrt(t3);
    return t1/(t2*t3);
}
~~~

Devuelve un valor entre 0 y 1
### Distancia euclídea
~~~javascript
function euclidean(matrix, u, v) {
    let Suv = [];
    for(let i = 0; i < matrix[0].length; i++) {
        if(matrix[u][i] !== "-" && matrix[v][i] !== "-"){
            Suv.push(i);
        }
    }
    if(Suv.length == 0){
        return 0;
    }
    let t1 = 0;
    for(let i = 0; i < Suv.length; i++) {
        t1 += Math.pow((Number(matrix[u][Suv[i]])) - (Number(matrix[v][Suv[i]])), 2);
    }
    return (-1)*Math.sqrt(t1);
}
~~~
Representa la similitud cómo la distancia entre dos puntos, luego devuelve una distancia positiva. Dado que, a diferencia de con las otras métricas, nos interesan los valores menores, multiplicamos todos los resultados por -1 para seleccionar estos valores siguiendo el criterio de las otras métricas (Seleccionar el valor mayor).

## Cálculo de la predicción
Para calcular la predicción se han implementado las siguientes funciones

### Predicción simple
~~~javascript
function simpPrediction(matrix, sim, k, method) {
    output = document.getElementById("outputNeighbors");
    let auxstr = "";
    for (let i = 0; i < matrix.length; i++) {
        if(matrix[i].indexOf("-") !== -1) {
            auxstr += "<p>Vecinos seleccionados para el Usuario " + String(i) + ": ";
            let N = [];
            for(let j = 0; j < k; j++) {
                let maxval = 0;
                while(N.indexOf(maxval) != -1){
                    maxval ++;
                }
                for (let e = 0; e < matrix[i].length; e++) {
                    if((Number(sim[i][e]) >= Number(sim[i][maxval])) && (N.indexOf(e) == -1) && (i != e)) {
                        maxval = e;
                    }
                }
                N.push(maxval);
            }
            for (let j = 0; j < matrix[i].length; j++) {
                if(matrix[i][j] == "-") {
                    let t1 = 0;
                    let t2 = 0;        
                    for(let e = 0; e < N.length; e++) {
                        if (matrix[N[e]][j] != "-") {
                            t1 += sim[i][N[e]]*matrix[N[e]][j];
                            t2 += Math.abs(sim[i][N[e]]);                         
                        }
                    }
                    if (t2 != 0) {
                        let result = Math.round(t1/t2)
                        
                        if (Number(method) == 3) {
                            result = -1*result; 
                        }
                        if (result < 0) {
                            result = 0;
                        } else if (result > 5) {
                            result = 5;
                        }
                        
                        matrix[i][j] = String(result);
                    }
                }
            }
            for (let j = 0; j < N.length; j++) {
                auxstr += "Usuario " + String(N[j]) + ", ";
            }
            auxstr += "</p>";
        }  
    }
    output.innerHTML = auxstr;
}
~~~

Para cada usuario con ítems sin calificar, evalúa los K vecinos más similares, y multiplica su índice de similitud por la calificación asignada al ítem i por dicho vecino. Se suman todos estos valores y se divide por el sumatorio total del valor absoluto de los índices de similitud de los K vecinos más similares.
### Diferencia con la media

~~~javascript
function avgPrediction(matrix, sim, k, method) {
    output = document.getElementById("outputNeighbors");
    let auxstr = "";
    for (let i = 0; i < matrix.length; i++) {
        if(matrix[i].indexOf("-") !== -1) {
            auxstr += "<p>Vecinos seleccionados para el Usuario " + String(i) + ": ";
            let N = [];
            for(let j = 0; j < k; j++) {
                let maxval = 0;
                while(N.indexOf(maxval) != -1){
                    maxval ++;
                }
                for (let e = 0; e < matrix[i].length; e++) {
                    if((Number(sim[i][e]) >= Number(sim[i][maxval])) && (N.indexOf(e) == -1) && (i != e)) {
                        maxval = e;
                    }
                }
                N.push(maxval);
            }
            for (let j = 0; j < matrix[i].length; j++) {
                if(matrix[i][j] == "-") {
                    let t1 = 0;
                    let t2 = 0;        
                    for(let e = 0; e < N.length; e++) {
                        if (matrix[N[e]][j] != "-") {
                            t1 += sim[i][N[e]]*(matrix[N[e]][j] - arrayAvg(matrix[N[e]]));
                            t2 += Math.abs(sim[i][N[e]]);
                        }
                    }
                    if (t2 != 0) {
                        let result = Math.round(t1/t2)
                        
                        if (Number(method) == 3) {
                            result = -1*result; 
                        }
                        if (result < 0) {
                            result = 0;
                        } else if (result > 5) {
                            result = 5;
                        }

                        matrix[i][j] = String(result);
                    }
                }
            }
            console.log(N);
            for (let j = 0; j < N.length; j++) {
                auxstr += "Usuario " + String(N[j]) + ", ";
            }
            auxstr += "</p>";
        }  
    }
    output.innerHTML = auxstr;
}
~~~

Funciona de forma similar a la función anterior, pero al calcular el sumatorio del producto de la similitud con un vecino k por la calificación del vecino k al ítem i, resta primero la media de las calificaciones del vecino k a la calificación del vecino k al ítem i.
