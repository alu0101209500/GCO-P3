// Inicialización:
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

//Manejo de ficheros
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

//Gesión de las operaciones de la matriz de utilidad
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

//Genera una matriz de similitud entre los clientes
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

//Permite obtener el índice de similitud entre dos vecinos
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

//Obtiene la media de todos los valores no nulos de una fila
function arrayAvg(array){
    let result = 0;
    let total = 0;
    array.forEach((e) => {
        if(e != "-"){
            result += Number(e);
            total ++;
        }
    });
    if(result == 0 || total == 0){
        return 0;
    } else {
        return (result/total);
    }
}

//Obtiene la similitud entre dos usuarios aplicando Pearson
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

//Obtiene la similitud entre dos usuarios aplicando distancia coseno
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

//Obtiene la similitud entre dos usuarios aplicando distancia euclídea
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

//Rellena los espacios nulos de la matriz aplicando predicción simple
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

//Rellena los espacios nulos de la matriz aplicando una predicción que evalua la distancia con la media
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

//Carga el contenido en el DOM de la página
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