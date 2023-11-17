/*Elegir provincia y ciudad, llamado a la api*/

async function obtenerProvincia(){
    fetch("https://apis.datos.gob.ar/georef/api/provincias?orden=nombre&campos=id,nombre")
    .then(res=>res.json())
    .then(data=>{
        
        const selectProvincia=document.getElementsByClassName("selectProvincia") 
        
        const selectLocatCiudad=document.getElementById("ciudadesLocat")
        const selectLocadCiudad=document.getElementById("ciudadesLocad")
        const selectCodCiudad=document.getElementById("ciudadesCod")
        const selectInmCiudad=document.getElementById("ciudadesInm")

        const selectLocat=document.getElementById("provinciasLocat")
        const selectLocad=document.getElementById("provinciasLocad")
        const selectInm=document.getElementById("provinciasInm")
        const selectCod=document.getElementById("provinciasCod")

        Array.from(selectProvincia).forEach(select =>{
        data.provincias.forEach(provincia=> {
            
            
            let nuevaOpcion = document.createElement("option");
            nuevaOpcion.value = provincia.id;
            nuevaOpcion.text = provincia.nombre;
            select.add(nuevaOpcion)
            } 
             )
        })
          selectCod.addEventListener("change",()=>rellenaCiudades(selectCod.value,selectCodCiudad))
          selectInm.addEventListener("change",()=>rellenaCiudades(selectInm.value,selectInmCiudad))
          selectLocad.addEventListener("change",()=>rellenaCiudades(selectLocad.value,selectLocadCiudad))
          selectLocat.addEventListener("change",()=>rellenaCiudades(selectLocat.value,selectLocatCiudad))

            

    
    }).catch(error=>{
        console.log(error)
    })


    async function rellenaCiudades(provinciaId,ciudadSelect) {
        console.log("change",provinciaId)
        // Obtiene el ID de la provincia seleccionada
        
      
        // Realiza la solicitud a la API para obtener las ciudades de la provincia
        fetch("https://apis.datos.gob.ar/georef/api/localidades?max=1000&campos=id,nombre&orden=nombre&provincia="+ provinciaId)
          .then(response => response.json())
          .then(data => {

            console.log(data)
            // Limpia las opciones anteriores en el select de ciudades
            ciudadSelect.innerHTML = "";
      
            // Agrega las ciudades obtenidas de la API al select de ciudades
            data.localidades.forEach(ciudad => {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = ciudad.id;
                nuevaOpcion.text = ciudad.nombre;
                ciudadSelect.add(nuevaOpcion)}   )
          })
          .catch(error => console.error("Error al obtener ciudades:", error));
      }

}



obtenerProvincia()

/*seleccionar varios archivos*/

/*
 * Variables
 */

let filesList = [];
const classDragOver = "drag-over";
const fileInputMulti = document.querySelector("#multi-selector-uniq #files");
// DEMO Preview
const multiSelectorUniqPreview = document.querySelector("#multi-selector-uniq #preview");

/*
 * Functions
 */

/**
 * Returns the index of an Array of Files from its name. If there are multiple files with the same name, the last one will be returned.
 * @param {string} name - Name file.
 * @param {Array<File>} list - List of files.
 * @return number
 */
function getIndexOfFileList(name, list) {
    return list.reduce(
        (position, file, index) => (file.name === name ? index : position),
        -1
    );
}

/**
 * Returns a File in text.
 * @param {File} file
 * @return {Promise<string>}
 */
async function encodeFileToText(file) {
    return file.text().then((text) => {
        return text;
    });
}

/**
 * Returns an Array from the union of 2 Arrays of Files avoiding repetitions.
 * @param {Array<File>} newFiles
 * @param {Array<File>} currentListFiles
 * @return Promise<File[]>
 */
async function getUniqFiles(newFiles, currentListFiles) {
    return new Promise((resolve) => {
        Promise.all(newFiles.map((inputFile) => encodeFileToText(inputFile))).then(
            (inputFilesText) => {
                // Check all the files to save
                Promise.all(
                    currentListFiles.map((savedFile) => encodeFileToText(savedFile))
                ).then((savedFilesText) => {
                    let newFileList = currentListFiles;
                    inputFilesText.forEach((inputFileText, index) => {
                        if (!savedFilesText.includes(inputFileText)) {
                            newFileList = newFileList.concat(newFiles[index]);
                        }
                    });
                    resolve(newFileList);
                });
            }
        );
    });
}

/**
 * Only DEMO. Render preview.
 * @param currentFileList
 * @Only .EMO> param target.
 * @
 */
function renderPreviews(currentFileList, target, inputFile) {
    //
    target.textContent = "";
    currentFileList.forEach((file, index) => {
        const myLi = document.createElement("li");
        myLi.textContent = file.name;
        myLi.setAttribute("draggable", 'true');
        myLi.dataset.key = file.name;
        myLi.addEventListener("drop", eventDrop);
        myLi.addEventListener("dragover", eventDragOver);
        const myButtonRemove = document.createElement("button");
        myButtonRemove.textContent = "Quitar";
        myButtonRemove.addEventListener("click", () => {
            filesList = deleteArrayElementByIndex(currentFileList, index);
            inputFile.files = arrayFilesToFileList(filesList);
            return renderPreviews(filesList, multiSelectorUniqPreview, inputFile);
        });
        myLi.appendChild(myButtonRemove);
        target.appendChild(myLi);
    });
}

/**
 * Returns a copy of the array by removing one position by index.
 * @param {Array<any>} list
 * @param {number} index
 * @return {Array<any>} list
 */
function deleteArrayElementByIndex(list, index) {
    return list.filter((item, itemIndex) => itemIndex !== index);
}

/**
 * Returns a FileLists from an array containing Files.
 * @param {Array<File>} filesList
 * @return {FileList}
 */
function arrayFilesToFileList(filesList) {
    return filesList.reduce(function (dataTransfer, file) {
        dataTransfer.items.add(file);
        return dataTransfer;
    }, new DataTransfer()).files;
}


/**
 * Returns a copy of the Array by swapping 2 indices.
 * @param {number} firstIndex
 * @param {number} secondIndex
 * @param {Array<any>} list
 */
function arraySwapIndex(firstIndex, secondIndex, list) {
    const tempList = list.slice();
    const tmpFirstPos = tempList[firstIndex];
    tempList[firstIndex] = tempList[secondIndex];
    tempList[secondIndex] = tmpFirstPos;
    return tempList;
}

/*
 * Events
 */

// Input file
fileInputMulti.addEventListener("input", async () => {
    // Get files list from <input>
    const newFilesList = Array.from(fileInputMulti.files);
    // Update list files
    filesList = await getUniqFiles(newFilesList, filesList);
    // Only DEMO. Redraw
    renderPreviews(filesList, multiSelectorUniqPreview, fileInputMulti);
    // Set data to input
    fileInputMulti.files = arrayFilesToFileList(filesList);
});

// Drag and drop

// Drag Start - Moving element.
let myDragElement = undefined;
document.addEventListener("dragstart", (event) => {
    // Saves which element is moving.
    myDragElement = event.target;
});

// Drag over - Element that is below the element that is moving.
function eventDragOver(event) {
    // Remove from all elements the class that will show that it is a drop zone.
    event.preventDefault();
    multiSelectorUniqPreview
        .querySelectorAll("li")
        .forEach((item) => item.classList.remove(classDragOver));

    // On the element above it, the class is added to show that it is a drop zone.
    event.target.classList.add(classDragOver);
}

// Drop - Element on which it is dropped.
function eventDrop(event) {
    // The element that is underneath the element that is moving when it is released is captured.
    const myDropElement = event.target;
    // The positions of the elements in the array are swapped. The dataset key is used as an index.
    filesList = arraySwapIndex(
        getIndexOfFileList(myDragElement.dataset.key, filesList),
        getIndexOfFileList(myDropElement.dataset.key, filesList),
        filesList
    );
    // The content of the input file is updated.
    fileInputMulti.files = arrayFilesToFileList(filesList);
    // Only DEMO. Changes are redrawn.
    renderPreviews(filesList, multiSelectorUniqPreview, fileInputMulti);
}



    

