Papa.parse('data/homicidios_dolosos_Sgo.csv', {
  download: true,
  header: true,
  complete: function(result) {
    const data = result.data;
    const datosPorAnio = {};

    // Agregación por año
    data.forEach(fila => {
      const anio = parseInt(fila.anio);
      if (isNaN(anio)) return;

      if (!datosPorAnio[anio]) {
        datosPorAnio[anio] = { fem: 0, masc: 0, sd: 0 };
      }

      const fem = parseInt(fila.cantidad_victimas_fem);
      const masc = parseInt(fila.cantidad_victimas_masc);
      const sd = parseInt(fila.cantidad_victimas_sd);

      if (!isNaN(fem)) datosPorAnio[anio].fem += fem;
      if (!isNaN(masc)) datosPorAnio[anio].masc += masc;
      if (!isNaN(sd)) datosPorAnio[anio].sd += sd;
    });

    const anios = Object.keys(datosPorAnio).map(Number).sort((a, b) => a - b);
    const slider = document.getElementById('slider');
    const labelMin = document.getElementById('label-min');
    const labelMax = document.getElementById('label-max');

    noUiSlider.create(slider, {
      start: [anios[0], anios[anios.length - 1]],
      connect: true,
      range: {
        min: anios[0],
        max: anios[anios.length - 1]
      },
      step: 1,
      tooltips: false
    });

    function actualizarGrafico(desde, hasta) {
      const aniosFiltrados = anios.filter(anio => anio >= desde && anio <= hasta);

      const yFem = aniosFiltrados.map(anio => datosPorAnio[anio].fem);
      const yMasc = aniosFiltrados.map(anio => datosPorAnio[anio].masc);
      const ySD = aniosFiltrados.map(anio => datosPorAnio[anio].sd);

      const traceFem = {
        x: aniosFiltrados,
        y: yFem,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Femeninas',
        line: { color: '#e74c3c', width: 2 },
        marker: { size: 6 }
      };

      const traceMasc = {
        x: aniosFiltrados,
        y: yMasc,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Masculinas',
        line: { color: '#5e0f5f', width: 2 },
        marker: { size: 6 }
      };

      const traceSD = {
        x: aniosFiltrados,
        y: ySD,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Sin definir',
        line: { color: '#95a5a6', dash: 'dot', width: 2 },
        marker: { size: 6 }
      };

      const layout = {
        title: `Víctimas de homicidio - ${desde} a ${hasta}`,
        font: { family: 'Arial', size: 14, color: '#333' },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        xaxis: { title: 'Año', tickformat: 'd' },
        yaxis: { title: 'Cantidad de víctimas', tickformat: ',d' },
        legend: { orientation: 'h', x: 0.1, y: -0.2 }
      };

      Plotly.newPlot('grafico', [traceFem, traceMasc, traceSD], layout, { responsive: true });
    }

    // Evento del slider
    slider.noUiSlider.on('update', function(values) {
      const desde = parseInt(values[0]);
      const hasta = parseInt(values[1]);

      labelMin.textContent = desde;
      labelMax.textContent = hasta;

      actualizarGrafico(desde, hasta);
    });

    // Mostrar todo por defecto
    actualizarGrafico(anios[0], anios[anios.length - 1]);
  },
  error: function(err) {
    console.error("Error al cargar CSV:", err);
    alert("No se pudo cargar el archivo de datos.");
  }
});
