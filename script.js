document.addEventListener('DOMContentLoaded', function () {



    const form = document.getElementById('packspec-form');
    const supplyChainUnitInput = document.getElementById('supply-chain-unit');
    const packageUnitInput = document.getElementById('package-unit');
    const materialFileInput = document.getElementById('csv-file');
    const templateFileInput = document.getElementById('example-csv-file');
    const downloadLink = document.getElementById('download-link');
    const huTypeFileInput = document.getElementById('hu-type');
    const packagingMaterialFileInput = document.getElementById('packaging-material');



// Create blobs
const blobContainer = document.querySelector('.blobs-container');
const numberOfBlobs = 10;
for (let i = 0; i < numberOfBlobs; i++) {
    const blob = document.createElement('div');
    blob.classList.add('blob');
    blob.style.top = `${Math.random() * 100}vh`; // Randomize vertical position
    blob.style.left = `${Math.random() * 100}vw`; // Randomize horizontal position
    blobContainer.appendChild(blob);
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const supplyChainUnit = supplyChainUnitInput.value;
    const packageUnit = packageUnitInput.value;
    const huType = huTypeFileInput.value;
    const packagingMaterial = packagingMaterialFileInput.value;
    const materialFile = materialFileInput.files[0];
    const templateFile = templateFileInput.files[0];

           // Retrieve values on form submit
           const batchMixAllowed = document.getElementById('batch-mix').checked;
           const hutypeVariable = document.getElementById('hu-checkbox').checked;
           const itemVariable = document.getElementById('items-checkbox').checked;
           const packmatVariable = document.getElementById('packaging-mat-checkbox').checked;
           
    if (materialFile && templateFile) {
        Promise.all([
            parseCSVFile(materialFile),
            parseCSVFile(templateFile)
        ]).then(([materialData, templateData]) => {
            console.log('Material Data:', materialData);
            console.log('Template Data:', templateData);


   
            const outputData = generateOutputCSV(materialData, templateData, huType,packagingMaterial,supplyChainUnit, packageUnit,batchMixAllowed,hutypeVariable,itemVariable,packmatVariable);
       
            console.log('Output Data:', outputData);
          
            const outputCSV = arrayToCSV(outputData);
            console.log('Output CSV:', outputCSV);

            triggerDownload(outputCSV, 'output.csv');
        }).catch(error => {
            console.error("Error parsing files:", error);
            alert("An error occurred while processing the files.");
        });
    } else {
        alert("Please upload both CSV files.");
    }
});

function parseCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target.result;

            // Detect delimiter by checking the first row
            const delimiters = [',', ';', '\t'];
            const firstRow = text.split('\n')[0];
            let detectedDelimiter = delimiters.reduce((a, b) => 
                (firstRow.split(a).length > firstRow.split(b).length ? a : b)
            );

            const rows = text.trim().split('\n').map(row => row.split(detectedDelimiter));
            resolve(rows);
        };
        reader.onerror = function (error) {
            reject(error);
        };
        reader.readAsText(file);
    });
}

function generateOutputCSV(materialData,templateData,huType,packagingMaterial,supplyChainUnit,packageUnit,batchMixAllowed,hutypeVariable,itemVariable,packmatVariable) {
    const outputData = [];
    // Find indices of each type (H, C, L, E, R) in templateData
    const indices = {
        H: templateData.findIndex(row => row[0] === 'H'),
        C: templateData.findIndex(row => row[0] === 'C'),
        L: templateData.findIndex(row => row[0] === 'L'),
        E: templateData.findIndex(row => row[0] === 'E'),
        R: templateData.findIndex(row => row[0] === 'R')
    };

    console.log('Indices:', indices);

    // Add the header row to outputData
    const headerRow = [
        "DL_RECTYPE", "PS Sequence", "DL_LEVEL_SEQ", "DL_REC_SEQ", "DL_FILLER",
        "Pack. Spec.", "Description", "Pack. Spec. Group", "CREATED_BY", "CREATED_AT",
        "ORIG_SYSTEM", "CHANGED_BY", "CHANGED_AT", "Upper Limit (D.Qty)", "Lower Rnd.Lmt(D.Qty)",
        "Up. Limit (%MnthDem)", "Low. Limit (%MthDem)", "Min. Qty for Suppl.", "Rounding Method",
        "Documents Exist", "Level Set", "Product ID", "Product", "Unit", "Quantity", "Base Unit",
        "Ref. Mix Allowed", "Batch Mix Allowed", "Pack. Spec.", "Level Seq. No.", "Target Qty",
        "Min. Qty", "Layer Qty", "Qty Classific.", "HU Type", "Rnd-Up Lim.(%PckSze)", "Rnd-D. Lim.(%PckSze)",
        "Minimum Pack Size", "Total Weight", "Loading Weight", "Weight Unit", "HU Tare Weight",
        "Weight Unit", "Total Volume", "Loading Volume", "Volume Unit", "Tare Volume", "Volume Unit",
        "Total Capacity", "Net Capacity", "Tare Cap.", "Length", "Width", "Height", "Unit",
        "Maximum Weight", "Excess Wgt Tolerance", "Tare Wt Var.", "Max. Volume", "Excess Volume Tol.",
        "Closed Pack.", "Max. Capacity", "Excess Cap. Tol.", "Max. Length", "Max. Width", "Max. Height",
        "Unit of Measure", "Minimum Volume", "Minimum Weight", "Min. Capacity", "Operative UoM",
        "Level Type", "Weight Man.", "Volume Man.", "Dim. Man.", "Capa. Man.", "Performing Ent.",
        "Print Long Text", "HU Crea.", "External Step", "Fill Up", "BAND_RND_UP", "BAND_RND_DOWN",
        "BAND_RND_NEAREST", "Product ID", "Product", "HU Relevance", "Unit", "Quantity",
        "Elem. Seq. No.", "Element Type", "Work Step", "Elem. Group", "Cond.Table", "Condition Type",
        "Valid From", "Valid To", "Condition Seq.", "Log. Condition", "Field name", "Value", "Field name",
        "Value", "Field name", "Value", "Field name", "Value", "Field name", "Value", "Field name",
        "Value", "Field name", "Value", "Field name", "Value", "Field name", "Value", "Field name",
        "Value", "Field name", "Value", "Field name", "Value", "Field name", "Value", "Field name", "Value", "Field name", "Value","Language", "Description"
    ];

    outputData.push(headerRow);



// Initialize counters for PS Sequence, DL_LEVEL_SEQ, and DL_REC_SEQ
let psSequenceCounter = 1;
let dlLevelSeqCounter = 1;
let dlRecSeqCounter = 1;


 // Iterate through materialData skipping the header row
for (let i = 1; i < materialData.length; i++) {
    
    const materialRow = materialData[i];
    const materialNumber = materialRow[0];
    const uom = String(materialRow[1]);
    const hutypevar = String(materialRow[2]);
    const itemsperbox = String(materialRow[3]);
    const packmat = String(materialRow[4]);

 // Create a set of rows for each type H, C, L, E, R and update accordingly
const hclerRows = ['H', 'C', 'L', 'E', 'R'].map(type => {
    const index = indices[type];
    if (index !== -1) {
        const templateRow = templateData[index].slice(); // Copy the template row

        templateRow[1] = psSequenceCounter; // PS Sequence
        templateRow[2] = dlLevelSeqCounter; // DL_LEVEL_SEQ
        templateRow[3] = dlRecSeqCounter; // DL_REC_SEQ

        // Update the templateRow with user parameters using headerIndices
        if (type === 'H') {
           
            templateRow[6] = materialNumber;
        } else if (type === 'C') {
            templateRow[22] = materialNumber;
            const sanitizedUom = String(uom).replace(/[\r\n]/g, '');
            templateRow[23] = sanitizedUom;
            if (batchMixAllowed == true){
                templateRow[27] = "X";
            }else{
                templateRow[27] = "";
            }
        } else if (type === 'L') {

            if(itemVariable){
                templateRow[headerIndices["Target Qty"]] = itemsperbox;
            }else{
                templateRow[headerIndices["Target Qty"]] = packageUnit;
            }
            
            if (hutypeVariable){
                templateRow[86] = hutypevar;
            }else{
                templateRow[34] = huType;
            }
        } else if (type === 'E') {
            if(packmatVariable){
                templateRow[85] = packmat;
            }else{
                templateRow[85] = packagingMaterial;
            }
            
    } else if (type === 'R') {
            templateRow[100] = supplyChainUnit; // Assuming supplyChainUnit is defined
            templateRow[102] = materialNumber;
            psSequenceCounter++; // Increment PS Sequence counter
        }

        return templateRow;

    }
});


  // Iterate through hclerRows to show alert and add rows to outputData
hclerRows.forEach(row => {
    if (row && Array.isArray(row)) {
        const firstValue = row[0];
        if (['H', 'C', 'L', 'E', 'R'].includes(firstValue)) {
            outputData.push(row); // Add the entire row to outputData
        }
    }
});

    // // Add an empty row after each set if it's not the last iteration
    // if (i < materialData.length - 1) {
    //     outputData.push([]);
    // }
}

    return outputData;
}

function arrayToCSV(data) {
    return data.map(row => row.join(';')).join('\n'); // Adjusted delimiter to ';'
}

function triggerDownload(csvContent, fileName) {
    // Replace line endings with Windows-style
    const csvWithWindowsLineEndings = csvContent.replace(/\n/g, '\r\n');
    
    // Create a Blob with the updated content
    const blob = new Blob([csvWithWindowsLineEndings], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = 'inline';
    downloadLink.click();
    URL.revokeObjectURL(url);
    downloadLink.style.display = 'none';
}

// Map the table headers
const headerIndices = {
    "DL_RECTYPE": 0,
    "PS Sequence": 1,
    "DL_LEVEL_SEQ": 2,
    "DL_REC_SEQ": 3,
    "DL_FILLER": 4,
    "Pack. Spec.": 5,
    "Description": 6,
    "Pack. Spec. Group": 7,
    "CREATED_BY": 8,
    "CREATED_AT": 9,
    "ORIG_SYSTEM": 10,
    "CHANGED_BY": 11,
    "CHANGED_AT": 12,
    "Upper Limit (D.Qty)": 13,
    "Lower Rnd.Lmt(D.Qty)": 14,
    "Up. Limit (%MnthDem)": 15,
    "Low. Limit (%MthDem)": 16,
    "Min. Qty for Suppl.": 17,
    "Rounding Method": 18,
    "Documents Exist": 19,
    "Level Set": 20,
    "Product ID": 21,
    "Product": 22,
    "Unit": 23,
    "Quantity": 24,
    "Base Unit": 25,
    "Ref. Mix Allowed": 26,
    "Batch Mix Allowed": 27,
    "Pack. Spec.": 28,
    "Level Seq. No.": 29,
    "Target Qty": 30,
    "Min. Qty": 31,
    "Layer Qty": 32,
    "Qty Classific.": 33,
    "HU Type": 34,
    "Rnd-Up Lim.(%PckSze)": 35,
    "Rnd-D. Lim.(%PckSze)": 36,
    "Minimum Pack Size": 37,
    "Total Weight": 38,
    "Loading Weight": 39,
    "Weight Unit": 40,
    "HU Tare Weight": 41,
    "Weight Unit": 42,
    "Total Volume": 43,
    "Loading Volume": 44,
    "Volume Unit": 45,
    "Tare Volume": 46,
    "Volume Unit": 47,
    "Total Capacity": 48,
    "Net Capacity": 49,
    "Tare Cap.": 50,
    "Length": 51,
    "Width": 52,
    "Height": 53,
    "Unit": 54,
    "Maximum Weight": 55,
    "Excess Wgt Tolerance": 56,
    "Tare Wt Var.": 57,
    "Max. Volume": 58,
    "Excess Volume Tol.": 59,
    "Closed Pack.": 60,
    "Max. Capacity": 61,
    "Excess Cap. Tol.": 62,
    "Max. Length": 63,
    "Max. Width": 64,
    "Max. Height": 65,
    "Unit of Measure": 66,
    "Minimum Volume": 67,
    "Minimum Weight": 68,
    "Min. Capacity": 69,
    "Operative UoM": 70,
    "Level Type": 71,
    "Weight Man.": 72,
    "Volume Man.": 73,
    "Dim. Man.": 74,
    "Capa. Man.": 75,
    "Performing Ent.": 76,
    "Print Long Text": 77,
    "HU Crea.": 78,
    "External Step": 79,
    "Fill Up": 80,
    "BAND_RND_UP": 81,
    "BAND_RND_DOWN": 82,
    "BAND_RND_NEAREST": 83,
    "Product ID": 84,
    "Product": 85,
    "HU Relevance": 86,
    "Unit": 87,
    "Quantity": 88,
    "Elem. Seq. No.": 89,
    "Element Type": 90,
    "Work Step": 91,
    "Elem. Group": 92,
    "Cond.Table": 93,
    "Condition Type": 94,
    "Valid From": 95,
    "Valid To": 96,
    "Condition Seq.": 97,
    "Log. Condition": 98,
    "Field name": 99,
    "Value": 100,
    "Field name": 101,
    "Value": 102,
    "Field name": 103,
    "Value": 104,
    "Field name": 105,
    "Value": 106,
    "Field name": 107,
    "Value": 108,
    "Field name": 109,
    "Value": 110,
    "Field name": 111,
    "Value": 112,
    "Field name": 113,
    "Value": 114,
    "Field name": 115,
    "Value": 116,
    "Field name": 117,
    "Value": 118,
    "Field name": 119,
    "Value": 120,
    "Value": 121,
    "Field name": 122,
    "Value": 123,
    "Field name": 124,
    "Value": 125,
    "Language": 126,
    "Description": 127
};

});
