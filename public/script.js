document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.getElementById('calculateButton');
    const bCoefficientsInput = document.getElementById('bCoefficients');
    const aCoefficientsInput = document.getElementById('aCoefficients');
    const xInputInput = document.getElementById('xInput');
    const lSamplesInput = document.getElementById('lSamples');
    const initialConditionsInput = document.getElementById('initialConditions');
    const outputDiv = document.getElementById('output');
    const plotCanvas = document.getElementById('plotCanvas');
    const plotCtx = plotCanvas.getContext('2d');

    let myChart; // To store the chart instance

    calculateButton.addEventListener('click', () => {
        const bCoefficientsStr = bCoefficientsInput.value;
        const aCoefficientsStr = aCoefficientsInput.value;
        const xInputStr = xInputInput.value;
        const lSamples = parseInt(lSamplesInput.value);
        const initialConditionsStr = initialConditionsInput.value;

        // Basic input validation
        if (!bCoefficientsStr || !aCoefficientsStr || !xInputStr || isNaN(lSamples)) {
            outputDiv.textContent = 'Please enter all the required information.';
            return;
        }

        const b = bCoefficientsStr.split(',').map(Number);
        const a = aCoefficientsStr.split(',').map(Number);
        const xInput = xInputStr.split(',').map(Number);
        const initialConditions = initialConditionsStr.split(',').map(Number);

        // Perform the difference equation calculation in JavaScript
        const { initialY, calculatedY, x } = solveDifferenceEquation(b, a, xInput, lSamples, initialConditions);

        const outputY = initialY.concat(calculatedY);
        outputDiv.textContent = JSON.stringify(outputY, null, 2);

        // Generate labels for the plot (n values)
        const nValues = Array.from({ length: x.length }, (_, i) => i - a.length);

        // Destroy previous chart if it exists
        if (myChart) {
            myChart.destroy();
        }

        // Create the chart
        myChart = new Chart(plotCtx, {
            type: 'scatter', // Changed chart type to 'scatter'
            data: {
                labels: nValues,
                datasets: [
                    {
                        label: 'Input x[n]',
                        data: x.map((value, index) => ({ x: nValues[index], y: value })), // Format data for scatter
                        backgroundColor: 'blue',
                        pointRadius: 5, // Adjust point size
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Output y[n]',
                        data: outputY.map((value, index) => ({ x: nValues[index], y: value })), // Format data for scatter
                        backgroundColor: 'red',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'n'
                        },
                        type: 'linear', // Ensure x-axis is linear for numbers
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amplitude'
                        }
                    }
                }
            }
        });
    });
});

function solveDifferenceEquation(b, a, xInput, lSamples, initialConditions) {
    const m = b.length - 1;
    const n = a.length - 1;

    // Calculate the full x sequence including zeros for initial conditions
    const xFull = Array(n).fill(0).concat(xInput).concat(Array(lSamples + 1 - xInput.length).fill(0));
    const y = initialConditions.concat(Array(lSamples + 1).fill(0));

    for (let q = n; q <= lSamples; q++) {
        let sumx = 0;
        let sumy = 0;
        for (let k = 0; k <= m; k++) {
            if (xFull[q - k] !== undefined) {
                sumx += b[k] * xFull[q - k];
            }
        }
        for (let k = 1; k <= n; k++) {
            if (y[q - k] !== undefined) {
                sumy += a[k] * y[q - k];
            }
        }
        y[q] = sumx - sumy;
    }

    const initialY = initialConditions;
    const calculatedY = y.slice(n);

    return { initialY, calculatedY, x: xFull };
}