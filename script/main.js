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
    result.forEach((e) => {e.length = matrix[0].length; e.fill(-1)});
    console.log(result);
}