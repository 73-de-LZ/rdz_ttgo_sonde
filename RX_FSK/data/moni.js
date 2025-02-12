// devLZ20240428 by LZ4TU and ChatGPT
document.addEventListener('DOMContentLoaded', function() {
    // Array to store telemetry data and local time
    let telemetryDataArray = [];
    let timerArray = [];
    let previousData = "";
    let energyChart;
    let environmentChart;
    let minVoltage = 10.00; // Predefined minimum value for voltage
    let maxVoltage = 15.00; // Predefined maximum value for voltage
    let minCurrent = -5.00; // Predefined minimum value for current
    let maxCurrent = 2.00; // Predefined maximum value for current
    let minTemperature = 0.00; // Predefined minimum value for temperature
    let maxTemperature = 40.00; // Predefined maximum value for temperature
    let minHumidity = 0.00; // Predefined minimum value for humidity
    let maxHumidity = 100.00; // Predefined maximum value for humidity

	// Function to fetch telemetry data and update the table
	function fetchAndUpdateTelemetry() {
	  // Make a request to the ESP32 server to get the telemetry data
	  fetch('/telemetry')
		.then(response => response.text())
		.then(data => {
		  // Check if the received data string has less than 39 symbols
		  if (data.trim().length < 39) {
			console.error('Incomplete telemetry data received:', data.trim());
			return; // Exit the function without processing incomplete data
		  }

		  // Check if the new data is different from the previous one
		  if (data.trim() !== previousData) {
			// Push the new data to the telemetry data array
			telemetryDataArray.push(data.trim());

			// Get the current local time and push it to the timerArray
			const localTime = new Date().toLocaleTimeString('en-US', {hour12: false}); // Use 24-hour format
			timerArray.push(localTime);

			// Split the telemetry data into an array of values
			const telemetryArray = data.trim().split(" ");

			// Calculate min and max values for voltage, current, temperature, and humidity
			calculateMinMaxValues(telemetryArray);

			// Update the table
			updateTable(telemetryArray);

			// Update the charts
			updateCharts();

			// Update previous data
			previousData = data.trim();
		  }
		})
		.catch(error => console.error('Error fetching telemetry data:', error));
	}

    // Function to calculate min and max values for voltage, current, temperature, and humidity
    function calculateMinMaxValues(telemetryArray) {
        // Calculate min and max values for voltage, current, temperature, and humidity
        minCurrent = Math.min(minCurrent, ...telemetryArray.map(data => parseFloat(data.split(" ")[1])));
        maxCurrent = Math.max(maxCurrent, ...telemetryArray.map(data => parseFloat(data.split(" ")[1])));
        minVoltage = Math.min(minVoltage, ...telemetryArray.map(data => parseFloat(data.split(" ")[0])));
        maxVoltage = Math.max(maxVoltage, ...telemetryArray.map(data => parseFloat(data.split(" ")[0])));
        minTemperature = Math.min(minTemperature, ...telemetryArray.map(data => Math.min(parseFloat(data.split(" ")[2]), parseFloat(data.split(" ")[3]))));
        maxTemperature = Math.max(maxTemperature, ...telemetryArray.map(data => Math.max(parseFloat(data.split(" ")[2]), parseFloat(data.split(" ")[3]))));
        minHumidity = Math.min(minHumidity, ...telemetryArray.map(data => Math.min(parseFloat(data.split(" ")[4]), parseFloat(data.split(" ")[5]))));
        maxHumidity = Math.max(maxHumidity, ...telemetryArray.map(data => Math.max(parseFloat(data.split(" ")[4]), parseFloat(data.split(" ")[5]))));


        // Clamp min and max values to the desired limits
        minVoltage = Math.max(minVoltage, 10.00);
        maxVoltage = Math.min(maxVoltage, 15.00);
        minCurrent = Math.max(minCurrent, -20.00);
        maxCurrent = Math.min(maxCurrent, 20.00);
        minTemperature = Math.min(minTemperature, -40.00);
        maxTemperature = Math.max(maxTemperature, 90.00);
        minHumidity = Math.min(minHumidity, 0.00);
        maxHumidity = Math.max(maxHumidity, 100.00);
    }

    // Function to update the table with telemetry data
    function updateTable(telemetryArray) {
        const parameters = ["U_batt [V]", "I_batt [A]", "t_int [\u00B0C]", "t_ext [\u00B0C]", "RH_int [%]", "RH_ext [%]", "RPM", "Time"];
        let tableHTML = '<table>';
        tableHTML += '<tr>';
        parameters.forEach(parameter => {
            tableHTML += '<th>' + parameter + '</th>';
        });
        // tableHTML += '<th>Time</th>';
        tableHTML += '</tr>';
        tableHTML += '<tr>';
        telemetryArray.forEach((value, index) => {
            let formattedValue;
            if (index === 0 || index === 1) { // Check if the value is for Voltage or Current
                formattedValue = parseFloat(value).toFixed(2); // Format to two decimal places
            } else {
                formattedValue = parseFloat(value).toFixed(1); // Format to one decimal place
            }
            tableHTML += '<td>' + formattedValue + '</td>';
        });
        tableHTML += '<td>' + timerArray[timerArray.length - 1] + '</td>';
        tableHTML += '</tr>';
        tableHTML += '</table>';
        document.getElementById('tableContainer').innerHTML = tableHTML;
    }

    // Function to update the charts with telemetry data
    function updateCharts() {
        const ctxEnergy = document.getElementById('energyChart').getContext('2d');
        const ctxEnvironment = document.getElementById('environmentChart').getContext('2d');

        // Destroy existing charts if they exist
        if (energyChart) {
            energyChart.destroy();
        }
        if (environmentChart) {
            environmentChart.destroy();
        }

        // Create new energy chart
        energyChart = new Chart(ctxEnergy, {
            type: 'line',
            data: {
                labels: timerArray,
                datasets: [{
                        label: 'U_batt',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[0])),
                        yAxisID: 'y',
                        borderColor: 'orange',
                        borderWidth: 2,
                        radius: 0,
                        tension: 0.15,
                        fill: false
                    },
                    {
                        label: 'I_batt',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[1])),
                        yAxisID: 'y1',
                        borderColor: 'cyan',
                        borderWidth: 2,
                        radius: 0,
                        tension: 0.15,						
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                stacked: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (local)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: minVoltage, // Set the minimum value for the Voltage scale
                        max: maxVoltage, // Set the maximum value for the Voltage scale
                        title: {
                            display: true,
                            text: 'Voltage (V)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return value.toFixed(2); // Format ticks to two decimal places
                            }
                        },
                        beginAtZero: false // Ensure the scale does not always start at zero
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: minCurrent, // Set the minimum value for the Current scale
                        max: maxCurrent, // Set the maximum value for the Current scale			
                        title: {
                            display: true,
                            text: 'Current (A)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return value.toFixed(2); // Format ticks to two decimal places
                            }
                        },
                        beginAtZero: false // Ensure the scale does not always start at zero
                    }
                }
            }
        });

        // Create new environment chart
        environmentChart = new Chart(ctxEnvironment, {
            type: 'line',
            data: {
                labels: timerArray,
                datasets: [{
                        label: 't Int.',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[2])),
                        yAxisID: 'y',
                        borderColor: 'red',
                        borderWidth: 2,
                        radius: 0,
                        tension: 0.15,						
                        fill: false
                    },
                    {
                        label: 't Ext.',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[3])),
                        borderColor: 'yellow',
                        borderWidth: 2,
                        radius: 0,
                        tension: 0.15,						
                        fill: false
                    },
                    {
                        label: 'RH Int.',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[4])),
                        yAxisID: 'y1',
                        borderColor: 'green',
                        backgroundColor: '#004000',
                        borderWidth: 2,
                        borderDash: [3, 5],
                        radius: 0,
                        tension: 0.15,						
                        fill: false
                    },
                    {
                        label: 'RH Ext.',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[5])),
                        yAxisID: 'y1',
                        borderColor: 'blue',
                        backgroundColor: 'navy',
                        borderWidth: 2,
                        borderDash: [3, 5],						
                        radius: 0,
                        tension: 0.15,						
                        fill: false
                    },
                    {
                        label: 'RPM',
                        data: telemetryDataArray.map(data => parseFloat(data.split(" ")[6])),
                        yAxisID: 'y2',
                        borderColor: 'teal',
                        backgroundColor: '#002222',
                        borderWidth: 1,
                        radius: 0,
                        tension: 0,						
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                stacked: false,				
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: minTemperature,
                        max: maxTemperature,
                        title: {
                            display: true,
                            text: 'Temperature (\u00B0C)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return value.toFixed(1);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: minHumidity,
                        max: maxHumidity,
                        title: {
                            display: true,
                            text: 'Humidity (%)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return value.toFixed(0);
                            }
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 20000,
                        title: {
                            display: false,
                            text: 'RPM'
                        },
                        ticks: {
                            display: false // Hide tick labels for RPM axis
                        }
                    }
                }
            }
        });
    }

    // Fetch telemetry data and update the table and charts initially
    fetchAndUpdateTelemetry();

    // Set interval to periodically fetch and update telemetry data
    setInterval(fetchAndUpdateTelemetry, 5000);

    // Function to convert telemetry data array to CSV format
	function convertToCSV() {
	  const csvRows = [];
	  const headers = ["Time", "U_batt [V]", "I_batt [A]", "t_int [°C]", "t_ext [°C]", "RH_int [%]", "RH_ext [%]", "RPM"];
	  csvRows.push(headers.join(',')); // Add headers as the first row
	  telemetryDataArray.forEach((data, index) => {
		const rowData = data.split(' ').join(','); // Convert each telemetry data entry to CSV format
		const time = timerArray[index]; // Get the corresponding time from timerArray
		csvRows.push(`${time},${rowData}`); // Prepend the time to the telemetry data and add to rows
	  });
	  return csvRows.join('\n'); // Join rows with newline characters
	}

	// Function to generate the file name with current date and time
	function generateFileName() {
	  const now = new Date();
	  const year = now.getFullYear();
	  const month = String(now.getMonth() + 1).padStart(2, '0');
	  const date = String(now.getDate()).padStart(2, '0');
	  const hours = String(now.getHours()).padStart(2, '0');
	  const minutes = String(now.getMinutes()).padStart(2, '0');
	  return `telemetry_data_${year}.${month}.${date}.${hours}.${minutes}.csv`;
	}

	// Function to download CSV file when button is clicked
	document.getElementById('downloadCSVButton').addEventListener('click', function() {
	  const csvContent = convertToCSV();
	  const blob = new Blob([csvContent], { type: 'text/csv' });
	  const url = window.URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = generateFileName(); // Set the download attribute with the generated file name
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
	  window.URL.revokeObjectURL(url);
	});
});
