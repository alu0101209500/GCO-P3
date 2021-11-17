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
    console.log(matrix);

    console.log("Vecinos: " + neighbors);
    switch (Number(prediction)) {
        case 2:
            console.log("Diferencia con la media")
            break;
        default:
            console.log("Simple")
            break;
    }
    generateSimilaritiesMatrix(matrix, method);
}

function generateSimilaritiesMatrix(matrix, method) {
    result = [];
    matrix.forEach((_) => {result.push([])});
    result.forEach((e) => {e.length = matrix.length; e.fill(-1)});
    console.log(result);
    for(let i = 0; i < result.length; i++) {
        result[i][i] = 0;
    }
    console.log(result);
    for(let i = 0; i < result.length; i++) {
        for(let j = 0; j < result[i].length; j++) {
            if(j >= i){
                break;
            }
            obtainSimilarityIndex(matrix, i, j, method)
        }
    }
}

function obtainSimilarityIndex(matrix, i, j, method){
    switch (Number(method)) {
        case 2:
            console.log("Distacia coseno")
            break;
        case 3:
            console.log("Distancia euclidea")
            break;
        default:
            console.log("Método Pearson")
            break;
    }
}

function arrayAvg(array){
    let result = 0;
    let total = 0;
    array.forEach((e) => {
        if(e != "-")
        result += Number(e);
        total ++;
    });

    return (result/total);
}
function pearson(matrix, u, v) {
    let Suv = [];
    for(let i = 0; i < matrix[0].length; i++) {
        if(matrix[u][i] !== "-" && matrix[u][i]){
            Suv.push(i);
        }
    }
    if(Suv.length == 0){
        return 0;
    }
    let t1 = 0, t2 = 0, t3 = 0;
    for(let i = 0; i < Suv.length; i++) {
        t1 += (matrix[u][i] - arrayAvg(matrix[u]))*(matrix[v][i] - arrayAvg(matrix[v]));
    }
    for(let i = 0; i < Suv.length; i++) {
        t2 += Math.pow((matrix[u][i] - arrayAvg(matrix[u])), 2);
    }
    for(let i = 0; i < Suv.length; i++) {
        t3 += Math.pow((matrix[v][i] - arrayAvg(matrix[v])), 2);
    }

    return t1/(t2*t3)
}

function cosDistance() {}

function euclidean() {}